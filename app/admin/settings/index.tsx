//app/admin/settings/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../../context/AuthContext";
import { adminService } from "../../../services/adminService";

type AdminUser = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  email: string;
  rol: string;
};

type AdminPermissions = {
  userId: number;
  puedeVerUsuarios: boolean;
  puedeBloquearUsuarios: boolean;
  puedeVerServicios: boolean;
  puedeAprobarServicios: boolean;
  puedeVerCupones: boolean;
  puedeVerReportes: boolean;
  puedeVerConfiguracion: boolean;
};

type Settings = {
  palabrasProhibidas: string[];
  autoModeracion: boolean;
  umbralReportes: number;
  suspensionPrimera: number;
  suspensionSegunda: number;
  suspensionTercera: 'permanente' | number;
  motivosSuspension: string[];
  emailOnBan: boolean;
  emailOnServiceApprove: boolean;
  pushOnNewReports: boolean;
  admins: AdminUser[];
};

const DEFAULT_SETTINGS: Settings = {
  palabrasProhibidas: [],
  autoModeracion: true,
  umbralReportes: 3,
  suspensionPrimera: 3,
  suspensionSegunda: 7,
  suspensionTercera: 'permanente',
  motivosSuspension: [],
  emailOnBan: true,
  emailOnServiceApprove: true,
  pushOnNewReports: true,
  admins: []
};

export default function AdminSettings() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [permisosAdmin, setPermisosAdmin] = useState<{ [key: number]: AdminPermissions }>({});

  const [newWord, setNewWord] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);

  const [newReason, setNewReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const settingsResponse = await adminService.getSettings();

      const settingsObj: any = {};
      if (Array.isArray(settingsResponse)) {
        settingsResponse.forEach((item: any) => {
          settingsObj[item.clave] = item.valor;
        });
      } else if (settingsResponse?.data) {
        settingsResponse.data.forEach((item: any) => {
          settingsObj[item.clave] = item.valor;
        });
      }

      const usersResponse = await adminService.getUsers({ rol: 'Admin' });
      const admins = usersResponse?.data || [];

      const permisosPromises = admins.map((admin: any) =>
        adminService.getSettingByKey(`permisos_admin_${admin.id}`).catch(() => null)
      );
      const permisosResults = await Promise.all(permisosPromises);

      const permisosAdminTemp: any = {};
      admins.forEach((admin: any, index: number) => {
        permisosAdminTemp[admin.id] = permisosResults[index]?.valor || {
          userId: admin.id,
          puedeVerUsuarios: true,
          puedeBloquearUsuarios: false,
          puedeVerServicios: true,
          puedeAprobarServicios: false,
          puedeVerCupones: false,
          puedeVerReportes: true,
          puedeVerConfiguracion: false
        };
      });

      setSettings({
        ...DEFAULT_SETTINGS,
        palabrasProhibidas: settingsObj.palabrasProhibidas || DEFAULT_SETTINGS.palabrasProhibidas,
        autoModeracion: settingsObj.autoModeracion ?? DEFAULT_SETTINGS.autoModeracion,
        umbralReportes: settingsObj.umbralReportes || DEFAULT_SETTINGS.umbralReportes,
        suspensionPrimera: settingsObj.suspensionPrimera || DEFAULT_SETTINGS.suspensionPrimera,
        suspensionSegunda: settingsObj.suspensionSegunda || DEFAULT_SETTINGS.suspensionSegunda,
        suspensionTercera: settingsObj.suspensionTercera || DEFAULT_SETTINGS.suspensionTercera,
        motivosSuspension: settingsObj.motivosSuspension || DEFAULT_SETTINGS.motivosSuspension,
        emailOnBan: settingsObj.emailOnBan ?? DEFAULT_SETTINGS.emailOnBan,
        emailOnServiceApprove: settingsObj.emailOnServiceApprove ?? DEFAULT_SETTINGS.emailOnServiceApprove,
        pushOnNewReports: settingsObj.pushOnNewReports ?? DEFAULT_SETTINGS.pushOnNewReports,
        admins: admins
      });

      setPermisosAdmin(permisosAdminTemp);

    } catch (error) {
      console.error("Error cargando configuración:", error);
      Alert.alert("Error", "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const promises = [
        adminService.upsertSetting('palabrasProhibidas', {
          valor: settings.palabrasProhibidas,
          tipo: 'json',
          descripcion: 'Palabras prohibidas en reseñas y comentarios'
        }),
        adminService.upsertSetting('autoModeracion', {
          valor: settings.autoModeracion,
          tipo: 'boolean',
          descripcion: 'Activar auto-moderación automática'
        }),
        adminService.upsertSetting('umbralReportes', {
          valor: settings.umbralReportes,
          tipo: 'number',
          descripcion: 'Número de reportes para activar moderación'
        }),
        adminService.upsertSetting('suspensionPrimera', {
          valor: settings.suspensionPrimera,
          tipo: 'number',
          descripcion: 'Días de suspensión por primera infracción'
        }),
        adminService.upsertSetting('suspensionSegunda', {
          valor: settings.suspensionSegunda,
          tipo: 'number',
          descripcion: 'Días de suspensión por segunda infracción'
        }),
        adminService.upsertSetting('suspensionTercera', {
          valor: settings.suspensionTercera,
          tipo: 'string',
          descripcion: 'Suspensión por tercera infracción (permanente o días)'
        }),
        adminService.upsertSetting('motivosSuspension', {
          valor: settings.motivosSuspension,
          tipo: 'json',
          descripcion: 'Motivos predefinidos para suspensión'
        }),
        adminService.upsertSetting('emailOnBan', {
          valor: settings.emailOnBan,
          tipo: 'boolean',
          descripcion: 'Enviar email al banear usuario'
        }),
        adminService.upsertSetting('emailOnServiceApprove', {
          valor: settings.emailOnServiceApprove,
          tipo: 'boolean',
          descripcion: 'Enviar email al aprobar servicio'
        }),
        adminService.upsertSetting('pushOnNewReports', {
          valor: settings.pushOnNewReports,
          tipo: 'boolean',
          descripcion: 'Enviar notificación push al recibir reportes'
        })
      ];

      const permisosPromises = Object.keys(permisosAdmin).map(userId =>
        adminService.upsertSetting(`permisos_admin_${userId}`, {
          valor: permisosAdmin[parseInt(userId)],
          tipo: 'json',
          descripcion: `Permisos del administrador ID ${userId}`
        })
      );

      await Promise.all([...promises, ...permisosPromises]);

      Alert.alert("Éxito", "Configuración guardada correctamente");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      Alert.alert("Error", "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const addProhibitedWord = () => {
    if (!newWord.trim()) return;

    setSettings({
      ...settings,
      palabrasProhibidas: [...settings.palabrasProhibidas, newWord.toLowerCase().trim()]
    });
    setNewWord('');
    setShowWordModal(false);
  };

  const removeProhibitedWord = (index: number) => {
    const newWords = [...settings.palabrasProhibidas];
    newWords.splice(index, 1);
    setSettings({ ...settings, palabrasProhibidas: newWords });
  };

  const addSuspensionReason = () => {
    if (!newReason.trim()) return;

    setSettings({
      ...settings,
      motivosSuspension: [...settings.motivosSuspension, newReason.trim()]
    });
    setNewReason('');
    setShowReasonModal(false);
  };

  const removeSuspensionReason = (index: number) => {
    const newReasons = [...settings.motivosSuspension];
    newReasons.splice(index, 1);
    setSettings({ ...settings, motivosSuspension: newReasons });
  };

  const removeAdmin = (id: number) => {
    Alert.alert(
      "Eliminar admin",
      "¿Estás seguro de eliminar este administrador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await adminService.updateUserRole(id, 'Cliente');
              const usersResponse = await adminService.getUsers({ rol: 'Admin' });
              setSettings({
                ...settings,
                admins: usersResponse?.data || []
              });
              Alert.alert("Éxito", "Administrador eliminado");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el administrador");
            }
          }
        }
      ]
    );
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      const usersResponse = await adminService.getUsers({ search: newAdminEmail });
      const user = usersResponse?.data?.find((u: any) => u.email === newAdminEmail);

      if (!user) {
        Alert.alert("Error", "Usuario no encontrado");
        return;
      }

      await adminService.updateUserRole(user.id, 'Admin');

      const adminsResponse = await adminService.getUsers({ rol: 'Admin' });
      setSettings({
        ...settings,
        admins: adminsResponse?.data || []
      });

      setPermisosAdmin({
        ...permisosAdmin,
        [user.id]: {
          userId: user.id,
          puedeVerUsuarios: true,
          puedeBloquearUsuarios: false,
          puedeVerServicios: true,
          puedeAprobarServicios: false,
          puedeVerCupones: false,
          puedeVerReportes: true,
          puedeVerConfiguracion: false
        }
      });

      setNewAdminEmail('');
      setShowAdminModal(false);
      Alert.alert("Éxito", "Administrador agregado");

    } catch (error) {
      console.error("Error agregando admin:", error);
      Alert.alert("Error", "No se pudo agregar el administrador");
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={adminStyles.screen}
        contentContainerStyle={[adminStyles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={adminStyles.header}>
          <Pressable onPress={() => router.back()} style={adminStyles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={adminStyles.headerTitle}>Configuración</Text>
          <Pressable onPress={handleSave} style={adminStyles.filterButton}>
            {saving ? (
              <ActivityIndicator size="small" color="#B7FF3C" />
            ) : (
              <Ionicons name="save-outline" size={22} color="#B7FF3C" />
            )}
          </Pressable>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#B7FF3C" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Reglas de moderación</Text>
              <Text style={adminStyles.sectionIntroText}>
                Define automatizaciones, umbral de reportes y palabras bloqueadas.
              </Text>
            </View>
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Auto-moderación</Text>
            <Switch
              value={settings.autoModeracion}
              onValueChange={(value) => setSettings({ ...settings, autoModeracion: value })}
              trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
              thumbColor={settings.autoModeracion ? '#1E1240' : '#FFFFFF'}
            />
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Umbral de reportes</Text>
            <View style={adminStyles.stepperWrap}>
              <Pressable
                onPress={() => setSettings({ ...settings, umbralReportes: Math.max(1, settings.umbralReportes - 1) })}
                style={adminStyles.stepperButton}
              >
                <Ionicons name="remove" size={16} color="#FF4FAF" />
              </Pressable>
              <Text style={adminStyles.stepperValue}>{settings.umbralReportes}</Text>
              <Pressable
                onPress={() => setSettings({ ...settings, umbralReportes: settings.umbralReportes + 1 })}
                style={adminStyles.stepperButtonLime}
              >
                <Ionicons name="add" size={16} color="#1E1240" />
              </Pressable>
            </View>
          </View>

          <Text style={adminStyles.filterLabel}>Palabras prohibidas</Text>
          <View style={adminStyles.chipsWrap}>
            {settings.palabrasProhibidas.map((word, index) => (
              <View key={index} style={adminStyles.pinkChip}>
                <Text style={adminStyles.pinkChipText}>{word}</Text>
                <Pressable onPress={() => removeProhibitedWord(index)}>
                  <Ionicons name="close-circle" size={16} color="#FF4FAF" />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={adminStyles.limeChip}
              onPress={() => setShowWordModal(true)}
            >
              <Ionicons name="add" size={15} color="#1E1240" />
              <Text style={adminStyles.limeChipText}>Agregar</Text>
            </Pressable>
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIconPink}>
              <Ionicons name="time-outline" size={18} color="#FF4FAF" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Tiempos de suspensión</Text>
              <Text style={adminStyles.sectionIntroText}>
                Ajusta la duración aplicada según reincidencia.
              </Text>
            </View>
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Primera infracción (días)</Text>
            <View style={adminStyles.stepperWrap}>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionPrimera: Math.max(1, settings.suspensionPrimera - 1) })}
                style={adminStyles.stepperButton}
              >
                <Ionicons name="remove" size={16} color="#FF4FAF" />
              </Pressable>
              <Text style={adminStyles.stepperValue}>{settings.suspensionPrimera}</Text>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionPrimera: settings.suspensionPrimera + 1 })}
                style={adminStyles.stepperButtonLime}
              >
                <Ionicons name="add" size={16} color="#1E1240" />
              </Pressable>
            </View>
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Segunda infracción (días)</Text>
            <View style={adminStyles.stepperWrap}>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionSegunda: Math.max(1, settings.suspensionSegunda - 1) })}
                style={adminStyles.stepperButton}
              >
                <Ionicons name="remove" size={16} color="#FF4FAF" />
              </Pressable>
              <Text style={adminStyles.stepperValue}>{settings.suspensionSegunda}</Text>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionSegunda: settings.suspensionSegunda + 1 })}
                style={adminStyles.stepperButtonLime}
              >
                <Ionicons name="add" size={16} color="#1E1240" />
              </Pressable>
            </View>
          </View>

          <View style={adminStyles.filterRow}>
            <Text style={adminStyles.filterLabel}>Tercera infracción</Text>
            <View style={adminStyles.filterOptions}>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionTercera: 15 })}
                style={[adminStyles.filterChip, settings.suspensionTercera === 15 && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, settings.suspensionTercera === 15 && adminStyles.filterChipTextActive]}>
                  15 días
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionTercera: 30 })}
                style={[adminStyles.filterChip, settings.suspensionTercera === 30 && adminStyles.filterChipPinkActive]}
              >
                <Text style={[adminStyles.filterChipText, settings.suspensionTercera === 30 && adminStyles.filterChipPinkTextActive]}>
                  30 días
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSettings({ ...settings, suspensionTercera: 'permanente' })}
                style={[adminStyles.filterChip, settings.suspensionTercera === 'permanente' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, settings.suspensionTercera === 'permanente' && adminStyles.filterChipTextActive]}>
                  Permanente
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIcon}>
              <Ionicons name="list-outline" size={18} color="#B7FF3C" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Motivos de suspensión</Text>
              <Text style={adminStyles.sectionIntroText}>
                Lista de motivos disponibles para acciones disciplinarias.
              </Text>
            </View>
          </View>

          <View style={adminStyles.stackRows}>
            {settings.motivosSuspension.map((reason, index) => (
              <View key={index} style={adminStyles.simpleRow}>
                <Text style={adminStyles.statText}>{reason}</Text>
                <Pressable onPress={() => removeSuspensionReason(index)}>
                  <Ionicons name="close-circle" size={18} color="#FF4FAF" />
                </Pressable>
              </View>
            ))}

            <Pressable
              style={adminStyles.userActionButton}
              onPress={() => setShowReasonModal(true)}
            >
              <Ionicons name="add" size={18} color="#B7FF3C" />
              <Text style={adminStyles.userActionText}>Agregar motivo</Text>
            </Pressable>
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIconPink}>
              <Ionicons name="notifications-outline" size={18} color="#FF4FAF" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Notificaciones</Text>
              <Text style={adminStyles.sectionIntroText}>
                Decide qué eventos notifican al equipo o a las personas usuarias.
              </Text>
            </View>
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Email al banear usuario</Text>
            <Switch
              value={settings.emailOnBan}
              onValueChange={(value) => setSettings({ ...settings, emailOnBan: value })}
              trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
              thumbColor={settings.emailOnBan ? '#1E1240' : '#FFFFFF'}
            />
          </View>

          <View style={adminStyles.settingRow}>
            <Text style={adminStyles.filterLabel}>Email al aprobar servicio</Text>
            <Switch
              value={settings.emailOnServiceApprove}
              onValueChange={(value) => setSettings({ ...settings, emailOnServiceApprove: value })}
              trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
              thumbColor={settings.emailOnServiceApprove ? '#1E1240' : '#FFFFFF'}
            />
          </View>

          <View style={adminStyles.settingRowLast}>
            <Text style={adminStyles.filterLabel}>Push al recibir reportes</Text>
            <Switch
              value={settings.pushOnNewReports}
              onValueChange={(value) => setSettings({ ...settings, pushOnNewReports: value })}
              trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
              thumbColor={settings.pushOnNewReports ? '#1E1240' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIcon}>
              <Ionicons name="people-outline" size={18} color="#B7FF3C" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Administradores y permisos</Text>
              <Text style={adminStyles.sectionIntroText}>
                Controla acceso a usuarios, servicios, cupones, reportes y configuración.
              </Text>
            </View>
          </View>

          {settings.admins.map((admin) => (
            <View key={admin.id} style={adminStyles.adminBlock}>
              <View style={adminStyles.adminHeaderRow}>
                <View style={adminStyles.adminIdentity}>
                  <View style={adminStyles.adminAvatar}>
                    <Text style={adminStyles.adminAvatarText}>
                      {admin.nombre.charAt(0)}
                      {admin.apellidoPaterno.charAt(0)}
                    </Text>
                  </View>
                  <View style={adminStyles.adminIdentityText}>
                    <Text style={adminStyles.statText}>{admin.nombre} {admin.apellidoPaterno}</Text>
                    <Text style={adminStyles.adminEmail}>{admin.email}</Text>
                  </View>
                </View>
                <Pressable onPress={() => removeAdmin(admin.id)} style={adminStyles.adminDeleteButton}>
                  <Ionicons name="trash-outline" size={18} color="#FF4FAF" />
                </Pressable>
              </View>

              <Text style={adminStyles.permissionTitle}>Permisos</Text>

              <View style={adminStyles.permissionRow}>
                <Text style={adminStyles.statText}>👥 Ver usuarios</Text>
                <Switch
                  value={permisosAdmin[admin.id]?.puedeVerUsuarios}
                  onValueChange={(value) => {
                    setPermisosAdmin({
                      ...permisosAdmin,
                      [admin.id]: { ...permisosAdmin[admin.id], puedeVerUsuarios: value }
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
                  thumbColor={permisosAdmin[admin.id]?.puedeVerUsuarios ? '#1E1240' : '#FFFFFF'}
                />
              </View>

              {permisosAdmin[admin.id]?.puedeVerUsuarios && (
                <View style={adminStyles.permissionSubRow}>
                  <Text style={adminStyles.statText}>🔨 Puede bloquear usuarios</Text>
                  <Switch
                    value={permisosAdmin[admin.id]?.puedeBloquearUsuarios}
                    onValueChange={(value) => {
                      setPermisosAdmin({
                        ...permisosAdmin,
                        [admin.id]: { ...permisosAdmin[admin.id], puedeBloquearUsuarios: value }
                      });
                    }}
                    trackColor={{ false: '#D1D5DB', true: '#FF4FAF' }}
                    thumbColor={permisosAdmin[admin.id]?.puedeBloquearUsuarios ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              )}

              <View style={adminStyles.permissionRow}>
                <Text style={adminStyles.statText}>📦 Ver servicios</Text>
                <Switch
                  value={permisosAdmin[admin.id]?.puedeVerServicios}
                  onValueChange={(value) => {
                    setPermisosAdmin({
                      ...permisosAdmin,
                      [admin.id]: { ...permisosAdmin[admin.id], puedeVerServicios: value }
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
                  thumbColor={permisosAdmin[admin.id]?.puedeVerServicios ? '#1E1240' : '#FFFFFF'}
                />
              </View>

              {permisosAdmin[admin.id]?.puedeVerServicios && (
                <View style={adminStyles.permissionSubRow}>
                  <Text style={adminStyles.statText}>✅ Puede aprobar servicios</Text>
                  <Switch
                    value={permisosAdmin[admin.id]?.puedeAprobarServicios}
                    onValueChange={(value) => {
                      setPermisosAdmin({
                        ...permisosAdmin,
                        [admin.id]: { ...permisosAdmin[admin.id], puedeAprobarServicios: value }
                      });
                    }}
                    trackColor={{ false: '#D1D5DB', true: '#FF4FAF' }}
                    thumbColor={permisosAdmin[admin.id]?.puedeAprobarServicios ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              )}

              <View style={adminStyles.permissionRow}>
                <Text style={adminStyles.statText}>🏷️ Ver cupones</Text>
                <Switch
                  value={permisosAdmin[admin.id]?.puedeVerCupones}
                  onValueChange={(value) => {
                    setPermisosAdmin({
                      ...permisosAdmin,
                      [admin.id]: { ...permisosAdmin[admin.id], puedeVerCupones: value }
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
                  thumbColor={permisosAdmin[admin.id]?.puedeVerCupones ? '#1E1240' : '#FFFFFF'}
                />
              </View>

              <View style={adminStyles.permissionRow}>
                <Text style={adminStyles.statText}>📊 Ver reportes</Text>
                <Switch
                  value={permisosAdmin[admin.id]?.puedeVerReportes}
                  onValueChange={(value) => {
                    setPermisosAdmin({
                      ...permisosAdmin,
                      [admin.id]: { ...permisosAdmin[admin.id], puedeVerReportes: value }
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
                  thumbColor={permisosAdmin[admin.id]?.puedeVerReportes ? '#1E1240' : '#FFFFFF'}
                />
              </View>

              <View style={adminStyles.permissionRowLast}>
                <Text style={adminStyles.statText}>⚙️ Ver configuración</Text>
                <Switch
                  value={permisosAdmin[admin.id]?.puedeVerConfiguracion}
                  onValueChange={(value) => {
                    setPermisosAdmin({
                      ...permisosAdmin,
                      [admin.id]: { ...permisosAdmin[admin.id], puedeVerConfiguracion: value }
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
                  thumbColor={permisosAdmin[admin.id]?.puedeVerConfiguracion ? '#1E1240' : '#FFFFFF'}
                />
              </View>
            </View>
          ))}

          <Pressable
            style={adminStyles.userActionButton}
            onPress={() => setShowAdminModal(true)}
          >
            <Ionicons name="person-add" size={18} color="#B7FF3C" />
            <Text style={adminStyles.userActionText}>Agregar administrador</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showWordModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Agregar palabra prohibida</Text>
            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="Ej: estafador"
              placeholderTextColor="#9CA3AF"
              value={newWord}
              onChangeText={setNewWord}
            />
            <View style={adminStyles.modalActions}>
              <Pressable style={adminStyles.modalCancelButton} onPress={() => setShowWordModal(false)}>
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={adminStyles.modalConfirmButton} onPress={addProhibitedWord}>
                <Text style={adminStyles.modalConfirmText}>Agregar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showReasonModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Agregar motivo de suspensión</Text>
            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="Ej: Acoso"
              placeholderTextColor="#9CA3AF"
              value={newReason}
              onChangeText={setNewReason}
            />
            <View style={adminStyles.modalActions}>
              <Pressable style={adminStyles.modalCancelButton} onPress={() => setShowReasonModal(false)}>
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={adminStyles.modalConfirmButton} onPress={addSuspensionReason}>
                <Text style={adminStyles.modalConfirmText}>Agregar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAdminModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Agregar administrador</Text>
            <Text style={adminStyles.modalSubtitle}>Email del usuario que será admin</Text>
            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="email@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              value={newAdminEmail}
              onChangeText={setNewAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={adminStyles.modalActions}>
              <Pressable style={adminStyles.modalCancelButton} onPress={() => setShowAdminModal(false)}>
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={adminStyles.modalConfirmButton}
                onPress={addAdmin}
              >
                <Text style={adminStyles.modalConfirmText}>Agregar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const adminStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  header: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    marginBottom: 18,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  userCardColumn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },

  sectionIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  sectionIntroIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(183,255,60,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIntroIconPink: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,79,175,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIntroTextWrap: {
    flex: 1,
  },

  sectionIntroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 3,
  },

  sectionIntroText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.05)",
  },

  settingRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },

  filterRow: {
    marginTop: 4,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 8,
  },

  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  filterChip: {
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  filterChipActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.36)",
  },

  filterChipPinkActive: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  filterChipTextActive: {
    color: "#1E1240",
  },

  filterChipPinkTextActive: {
    color: "#A61E6E",
  },

  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F8",
  },

  stepperButtonLime: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B7FF3C",
  },

  stepperValue: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },

  pinkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  pinkChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  limeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4FCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  limeChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  stackRows: {
    gap: 8,
  },

  simpleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.05)",
  },

  statText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },

  userActionButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },

  userActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  adminBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(17, 24, 39, 0.05)",
    paddingTop: 14,
    marginTop: 2,
    marginBottom: 8,
  },

  adminHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  adminIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  adminAvatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
  },

  adminIdentityText: {
    flex: 1,
  },

  adminEmail: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },

  adminDeleteButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFF1F8",
    alignItems: "center",
    justifyContent: "center",
  },

  permissionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 8,
  },

  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  permissionSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 16,
  },

  permissionRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.34)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
  },

  modalInputSingle: {
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    marginBottom: 10,
    minHeight: 42,
  },

  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FFF1F8",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },
});