"use client";

import { useState, useEffect } from "react";
import { sessionsApi } from "@/lib/api";
import { Session } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  User,
  PenLine,
  Calendar,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default function ApprenantAgendaPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [totalHeures, setTotalHeures] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await sessionsApi.getAll();
        const data: Session[] = response.data.data;
        setSessions(data);
        const minutes = data
          .filter((s) => s.statut === "TERMINEE")
          .reduce((acc, s) => acc + s.dureeMinutes, 0);
        setTotalHeures(Math.round(minutes / 60));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const firstDayOfWeek = (getDay(startOfMonth(currentDate)) + 6) % 7;

  const getSessionsForDay = (day: Date) =>
    sessions.filter((s) => isSameDay(new Date(s.dateDebut), day));

  const selectedDaySessions = selectedDay ? getSessionsForDay(selectedDay) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon agenda</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalHeures}h de formation suivies au total
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
          {totalHeures}h suivies
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {daysInMonth.map((day) => {
              const daySessions = getSessionsForDay(day);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative rounded-xl p-2 text-sm transition-all min-h-[56px] flex flex-col items-center gap-1
                    ${isSelected ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-50"}
                    ${today && !isSelected ? "ring-2 ring-blue-400 ring-offset-1" : ""}
                  `}
                >
                  <span className={`text-xs font-semibold ${isSelected ? "text-white" : today ? "text-blue-600" : "text-gray-700"}`}>
                    {format(day, "d")}
                  </span>
                  {daySessions.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {daySessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.statut === "A_VENIR"
                              ? isSelected ? "bg-blue-200" : "bg-blue-400"
                              : s.statut === "EN_COURS"
                              ? isSelected ? "bg-yellow-200" : "bg-yellow-400"
                              : isSelected ? "bg-green-200" : "bg-green-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day sessions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 capitalize">
            {selectedDay
              ? format(selectedDay, "EEEE d MMMM", { locale: fr })
              : "Sélectionnez un jour"}
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : selectedDaySessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Aucune session ce jour</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDaySessions.map((session) => {
                const isSigned = session.signatures && session.signatures.length > 0;
                const needsSignature =
                  session.statut === "TERMINEE" && !isSigned;

                return (
                  <div
                    key={session.id}
                    className={`border rounded-xl p-3 transition ${
                      needsSignature
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {session.module?.nom}
                      </p>
                      <StatusBadge status={session.statut} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={12} />
                        <span>
                          {session.formateur?.prenom} {session.formateur?.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>
                          {format(new Date(session.dateDebut), "HH:mm")} –{" "}
                          {format(new Date(session.dateFin), "HH:mm")} (
                          {formatDuration(session.dureeMinutes)})
                        </span>
                      </div>
                    </div>

                    {needsSignature && (
                      <Link
                        href={`/apprenant/signature/${session.id}`}
                        className="mt-2.5 flex items-center justify-center gap-1.5 w-full bg-orange-500 text-white text-xs font-medium py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        <PenLine size={12} />
                        Signer la session
                      </Link>
                    )}
                    {isSigned && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Attestée et signée
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
