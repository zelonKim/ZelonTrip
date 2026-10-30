"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Compass, ArrowRight, CalendarDays, Inbox } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTripList } from "@/api/trip/getTripList";
import { TripListElement } from "@/types/TripList";
import { usePlansLanguage } from "@/hooks/languages/usePlansLanguage";

export default function PlansPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = usePlansLanguage(); 

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tripList"],
    queryFn: getTripList,
  });

  const handlePlanPress = (id: string | number) => {
    router.push(`/plan/${id}`);
  };

  if (isPending) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 gap-3 transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
        }`}
      >
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p
          className={`text-sm font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t.loading}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 text-center transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
        }`}
      >
        <h2 className="text-base font-bold text-red-500 mb-1">
          {t.errorTitle}
        </h2>
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {error?.message || t.defaultError}
        </p>
      </div>
    );
  }

  const plans = data?.trips || [];

  return (
    <div
      className={`min-h-screen pb-10 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <header
          className={`mb-3 border-b pb-4 ${
            isDarkMode ? "border-gray-800" : "border-b-transparent"
          }`}
        >
          <h1 className="text-2xl font-bold mb-1.5">{t.headerTitle}</h1>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } leading-relaxed`}
          >
            {t.headerDesc}
          </p>
        </header>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-1.5">
            <Inbox
              size={40}
              className={isDarkMode ? "text-gray-600" : "text-gray-400"}
            />
            <h3
              className={`text-sm font-semibold mt-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              {t.emptyTitle}
            </h3>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plans.map((plan: TripListElement) => (
              <div
                key={plan.id}
                onClick={() => handlePlanPress(plan.id)}
                className={`border rounded-2xl p-4.5 shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-md ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                    : "bg-white border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                      isDarkMode
                        ? "bg-blue-950/40 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <MapPin size={14} />
                    <span className="text-[11px] font-bold">
                      {plan.location}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <CalendarDays size={13} />
                    <span
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {plan.itinerary?.length === 1
                        ? t.dayTrip
                        : t.formatDays(plan.itinerary?.length || 1)}
                    </span>
                  </div>
                </div>

                <h2
                  className={`text-lg font-bold mb-2.5 pl-1.5 line-clamp-2 leading-snug ${
                    isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {plan.title}
                </h2>

                <div
                  className={`flex items-start rounded-xl p-3 mb-3.5 transition-colors ${
                    isDarkMode ? "bg-gray-900/60" : "bg-gray-50"
                  }`}
                >
                  <Compass
                    size={16}
                    className={`mt-0.5 mr-2 flex-shrink-0 ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`text-sm leading-normal line-clamp-3 flex-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {plan.overview}
                  </p>
                </div>

                <div
                  className={`flex items-center justify-end gap-1 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  <span className="text-xs font-semibold">{t.detailView}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
