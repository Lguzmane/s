// components/profile/CalendarGrid.tsx
import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import api from "../../services/api";
import bookingService from "../../services/bookingService";

// Helpers
const getDayAbbreviation = (date: Date) =>
  date
    .toLocaleDateString("es-ES", { weekday: "short" })
    .charAt(0)
    .toUpperCase() +
  date.toLocaleDateString("es-ES", { weekday: "short" }).slice(1, 3);

const formatDate = (date: Date) =>
  `${date.getDate()} ${date.toLocaleDateString("es-ES", { month: "short" })}`;

const getDateISO = (date: Date) => date.toISOString().split("T")[0];

const generateTimeSlots = (start: number, end: number, interval: number) => {
  const slots: string[] = [];
  let current = start * 60;
  const endTime = end * 60;
  while (current < endTime) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    slots.push(timeStr);
    current += interval;
  }
  return slots;
};

type Props = {
  profesionalId: number;
  onBlockSelect: (
    dayStr: string,
    time: string,
    timeSlots: string[],
    reservations: any[]
  ) => void;
  selectedBlocks?: { day: string; time: string }[];
  calendarData?: Record<string, Record<string, string>>;
};

export default function CalendarGrid({
  profesionalId,
  onBlockSelect,
  selectedBlocks = [],
  calendarData = {},
}: Props) {
  const [isAM, setIsAM] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!profesionalId) return;

      try {
        setLoading(true);
        const fechaStr = getDateISO(currentDate);

        const response = await bookingService.getAvailability(
          profesionalId.toString(),
          fechaStr
        );

        if (response.success) {
          setAvailabilitySlots(response.data.disponibilidad || []);
          setReservas(response.data.reservas || []);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [profesionalId, currentDate]);

  const toggleAMPM = () => setIsAM((prev) => !prev);

  const disponibilidadMap: Record<string, Record<string, string>> = {};

  availabilitySlots.forEach((slot) => {
    const fechaStr = getDateISO(new Date(slot.fecha));
    const horaStr =
      typeof slot.horaInicio === "string" && slot.horaInicio.length === 5
        ? slot.horaInicio
        : new Date(slot.horaInicio).toISOString().slice(11, 16);

    if (!disponibilidadMap[fechaStr]) {
      disponibilidadMap[fechaStr] = {};
    }

    disponibilidadMap[fechaStr][horaStr] = slot.estado;
  });

  const nextDays = Array.from({ length: 4 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const timeSlots = isAM
    ? generateTimeSlots(8, 12, 30)
    : generateTimeSlots(12, 18, 30);

  const isReserved = (day: string, time: string) =>
    reservas.some((r) => {
      const fecha = new Date(r.fechaHora);
      const rDay = fecha.toISOString().split("T")[0];
      const rTime = fecha.toISOString().slice(11, 16);
      return rDay === day && rTime === time;
    });

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (_dayStr: string) => {
    return;
  };

  return (
    <View style={styles.container}>
      {/* AM / PM Toggle */}
      <View style={[styles.rowCenter, styles.mbSm]}>
        <Pressable
          onPress={toggleAMPM}
          style={[
            styles.segment,
            styles.segmentLeft,
            isAM ? styles.segmentActive : styles.segmentInactive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              isAM ? styles.segmentTextOn : styles.segmentTextOff,
            ]}
          >
            AM
          </Text>
        </Pressable>

        <Pressable
          onPress={toggleAMPM}
          style={[
            styles.segment,
            styles.segmentRight,
            !isAM ? styles.segmentActive : styles.segmentInactive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              !isAM ? styles.segmentTextOn : styles.segmentTextOff,
            ]}
          >
            PM
          </Text>
        </Pressable>
      </View>

      {/* Días */}
      <View style={[styles.rowBetween, styles.mbSm]}>
        <Pressable onPress={handlePrev} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>

        <View style={styles.daysRow}>
          <View style={styles.daysContent}>
            {nextDays.map((date, idx) => {
              const dayStr = getDateISO(date);
              const isSelectedDay = selectedBlocks.some(
                (b) => b.day === dayStr
              );

              return (
                <Pressable
                  key={idx}
                  onPress={() => handleDayClick(dayStr)}
                  style={[
                    styles.dayCard,
                    isSelectedDay
                      ? styles.dayCardSelected
                      : styles.dayCardDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayTitle,
                      isSelectedDay
                        ? styles.dayTitleSelected
                        : styles.dayTitleDefault,
                    ]}
                  >
                    {getDayAbbreviation(date)}
                  </Text>
                  <Text style={styles.daySub}>{formatDate(date)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable onPress={handleNext} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Horas */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {timeSlots.map((time, idx) => (
            <View key={idx} style={styles.rowBetween}>
              <View style={styles.navSpacer} />

              <View style={styles.gridRow}>
                {nextDays.map((date, j) => {
                  const dayStr = getDateISO(date);
                  const estado = disponibilidadMap[dayStr]?.[time];

                  const bloqueado = estado === "bloqueado";
                  const ocupado = isReserved(dayStr, time);

                  const isSelected = selectedBlocks.some(
                    (b) => b.day === dayStr && b.time === time
                  );

                  const stateStyle = bloqueado
                    ? [styles.cellBlocked, styles.cellBorderBlocked]
                    : ocupado
                    ? [styles.cellReserved, styles.cellBorderReserved]
                    : isSelected
                    ? [styles.cellSelected, styles.cellBorderSelected]
                    : [styles.cellDefault, styles.cellBorderDefault];

                  const textStyle = bloqueado
                    ? styles.cellTextBlocked
                    : ocupado
                    ? styles.cellTextReserved
                    : isSelected
                    ? styles.cellTextSelected
                    : styles.cellTextDefault;

                  return (
                    <Pressable
                      key={j}
                      onPress={() =>
                        onBlockSelect(dayStr, time, timeSlots, reservas)
                      }
                      style={[styles.cell, ...stateStyle]}
                      disabled={bloqueado || ocupado}
                    >
                      <Text style={[styles.cellTextBase, textStyle]}>
                        {bloqueado
                          ? "Bloqueado"
                          : ocupado
                          ? "Reservado"
                          : time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.navSpacer} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },

  row: {
    flexDirection: "row",
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mbSm: {
    marginBottom: 8,
  },

  segment: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F9FAFB",
  },
  segmentLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  segmentRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  segmentActive: {
    backgroundColor: "#1E1240",
    borderColor: "#1E1240",
  },
  segmentInactive: {
    backgroundColor: "#F9FAFB",
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "600",
  },
  segmentTextOn: {
    color: "#FFFFFF",
  },
  segmentTextOff: {
    color: "#111827",
  },

  navBtn: {
    width: 32,
    alignItems: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  navSpacer: {
    width: 32,
  },

  daysRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    columnGap: 8,
  },

  daysContent: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    columnGap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dayCardDefault: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F9FAFB",
  },
  dayCardSelected: {
    backgroundColor: "#F9FAFB",
    borderColor: "#65F7F7",
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dayTitleDefault: {
    color: "#111827",
  },
  dayTitleSelected: {
    color: "#1E1240",
  },
  daySub: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
    textTransform: "capitalize",
  },

  gridRow: {
    flex: 1,
    flexDirection: "row",
  },

  cell: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cellDefault: {
    backgroundColor: "#FFFFFF",
  },
  cellBorderDefault: {
    borderColor: "#F9FAFB",
  },

  cellSelected: {
    backgroundColor: "#F9FAFB",
  },
  cellBorderSelected: {
    borderColor: "#65F7F7",
  },

  cellReserved: {
    backgroundColor: "#F9FAFB",
  },
  cellBorderReserved: {
    borderColor: "#F9FAFB",
  },

  cellBlocked: {
    backgroundColor: "#F9FAFB",
  },
  cellBorderBlocked: {
    borderColor: "#F59E0B",
  },

  cellTextBase: {
    fontSize: 12,
    fontWeight: "400",
  },
  cellTextDefault: {
    color: "#111827",
  },
  cellTextSelected: {
    color: "#1E1240",
    fontWeight: "600",
  },
  cellTextReserved: {
    color: "#111827",
  },
  cellTextBlocked: {
    color: "#F59E0B",
  },
});