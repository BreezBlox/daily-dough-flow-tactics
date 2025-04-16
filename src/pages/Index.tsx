
import { useState, useEffect } from "react";
import LineGraph, { IntervalType } from "@/components/LineGraph";
import Calendar from "@/components/Calendar";
// import BarGraph from "@/components/BarGraph"; // No longer used
import BillForm from "@/components/BillForm";
import CsvImport from "@/components/CsvImport";
import PaycheckForm from "@/components/PaycheckForm";
import EntryList from "@/components/EntryList";
import { FinancialEntry, EntryType, DailyReserve } from "@/types";
import { calculateRecurringEntries, calculateDailyReserves, formatDateToMonthDayYear } from "@/utils/dateUtils";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const [entryType, setEntryType] = useState<EntryType>("bill");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [reserves, setReserves] = useState<DailyReserve[]>([]);
  const [interval, setInterval] = useState<IntervalType>("monthly");
  
  // Calculate reserves when entries or selectedDate change
  useEffect(() => {
    // Always show 24 months of data, but start from the earliest entry date for true running balance
    let minEntryDate = entries.length > 0 ? entries.reduce((min, e) => e.date < min ? e.date : min, entries[0].date) : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    minEntryDate = new Date(minEntryDate.getFullYear(), minEntryDate.getMonth(), 1); // snap to first of month
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 24, 0); // 24 months ahead
    // Calculate all recurring entries for 24 months
    const recurringEntries = calculateRecurringEntries(entries, minEntryDate, endDate);
    // Calculate daily reserves for 24 months
    const dailyReserves = calculateDailyReserves(recurringEntries, minEntryDate, endDate);
    setReserves(dailyReserves);
  }, [entries, selectedDate]);

  // Handle form submission
  
  // Handle form submission
  const handleEntrySubmit = (newEntry: Omit<FinancialEntry, 'id'>) => {
    const entryWithId: FinancialEntry = {
      ...newEntry,
      id: uuidv4()
    };
    setEntries(prevEntries => [...prevEntries, entryWithId]);
  };

  // Bulk import handler for CSV
  const handleCsvImport = (imported: FinancialEntry[]) => {
    setEntries(prev => [...prev, ...imported]);
  };
  
  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };
  

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('financialEntries');
    if (savedEntries) {
      // Parse entries and convert date strings back to Date objects
      const parsedEntries: FinancialEntry[] = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
    }
  }, []);
  
  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('financialEntries', JSON.stringify(entries));
  }, [entries]);

  return (
    <div className="min-h-screen bg-mgs-black p-2 sm:p-4 md:p-8">
      <header className="text-center border-b border-mgs-green pb-4 mb-6">
        <h1 className="text-4xl font-orbitron text-mgs-green tracking-wider">Daily Dough Flow</h1>
        <p className="font-orbitron text-mgs-lightgray mt-1 text-xs tracking-widest">// TACTICAL FINANCE MANAGEMENT //</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left Panel - Bar Graph */}
        <div className="w-full md:w-3/5 bg-opacity-30 border border-mgs-green p-2 sm:p-4 animate-fade-in flex flex-col items-center justify-center min-h-[250px] sm:min-h-[350px] md:min-h-[400px]">
          <h2 className="font-orbitron text-lg text-center mb-4 pb-2 border-b border-mgs-green">
            Reserve Forecast
          </h2>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {[
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "3 Months", value: "quarterly" },
              { label: "6 Months", value: "semiannually" },
              { label: "12 Months", value: "annually" }
            ].map(opt => (
              <button
                key={opt.value}
                className={`px-2 py-1 rounded font-orbitron border text-xs sm:text-sm transition-colors ${interval === opt.value ? 'bg-mgs-green text-mgs-black border-mgs-green' : 'bg-mgs-black text-mgs-green border-mgs-green hover:bg-mgs-green/30'}`}
                onClick={() => setInterval(opt.value as IntervalType)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="w-full flex-1 flex items-center justify-center overflow-x-auto">
            <LineGraph data={reserves} interval={interval} selectedDate={selectedDate} entries={entries} />
          </div>

          {/* Export Forecast Button */}
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 rounded font-orbitron border text-xs sm:text-sm bg-mgs-green text-mgs-black border-mgs-green hover:bg-mgs-green/80 transition-colors"
              onClick={() => {
                // Aggregate monthly reserves for 24 months
                const monthly = [];
                let lastMonth = -1;
                for (const r of reserves) {
                  const month = r.date.getMonth();
                  const year = r.date.getFullYear();
                  if (monthly.length === 0 || (month !== lastMonth && r.date.getDate() > 25)) {
                    monthly.push({
                      date: new Date(year, month + 1, 0),
                      reserve: r.reserve
                    });
                    lastMonth = month;
                  }
                }
                // Generate CSV for monthly forecast (24 months)
                let csvMonthly = 'Month,Reserve\n';
                csvMonthly += monthly.map(row => `${row.date.toISOString().slice(0, 10)},${row.reserve}`).join('\n');
                // Generate CSV for 12-month forecast
                let csv12 = 'Month,Reserve\n';
                csv12 += monthly.slice(0,12).map(row => `${row.date.toISOString().slice(0, 10)},${row.reserve}`).join('\n');
                // Download both CSVs
                const download = (csv: string, filename: string) => {
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 100);
                };
                download(csvMonthly, 'monthly_forecast.csv');
                download(csv12, '12_month_forecast.csv');
              }}
            >
              Export Forecast
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-orbitron text-mgs-green text-sm mb-3 border-b border-mgs-gray pb-2">Operations Log</h3>
            <EntryList 
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        </div>
        
        {/* Right Panel - Forms */}
        <div className="w-full md:w-2/5 bg-opacity-30 border border-mgs-green p-2 sm:p-4 animate-fade-in">
          <h2 className="font-orbitron text-lg text-center mb-4 pb-2 border-b border-mgs-green">
            Intel Input Terminal
          </h2>
          
          <CsvImport onImport={handleCsvImport} />
          <div>
            <h3 className="font-orbitron text-sm text-center mb-2">
              Selected Date: {formatDateToMonthDayYear(selectedDate)}
            </h3>
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          
          <div className="flex justify-center gap-6 mb-4 border-t border-b border-mgs-gray py-3">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="entryType" 
                checked={entryType === "bill"}
                onChange={() => setEntryType("bill")}
                className="appearance-none w-5 h-5 border-2 border-mgs-gray rounded-full relative cursor-pointer checked:border-mgs-green before:content-[''] before:block before:absolute before:w-3 before:h-3 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-mgs-green before:scale-0 checked:before:scale-100 before:transition-transform"
              />
              <span className="text-mgs-lightgray text-xs uppercase ml-1 font-medium">
                Log Expenditure
              </span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="entryType" 
                checked={entryType === "paycheck"}
                onChange={() => setEntryType("paycheck")}
                className="appearance-none w-5 h-5 border-2 border-mgs-gray rounded-full relative cursor-pointer checked:border-mgs-green before:content-[''] before:block before:absolute before:w-3 before:h-3 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-mgs-green before:scale-0 checked:before:scale-100 before:transition-transform"
              />
              <span className="text-mgs-lightgray text-xs uppercase ml-1 font-medium">
                Log Acquisition
              </span>
            </label>
          </div>
          
          {entryType === "bill" ? (
            <BillForm 
              selectedDate={selectedDate}
              onSubmit={handleEntrySubmit}
            />
          ) : (
            <PaycheckForm 
              selectedDate={selectedDate}
              onSubmit={handleEntrySubmit}
            />
          )}
        </div>
      </div>
      
      <footer className="mt-8 py-4 border-t border-mgs-gray text-center text-xs text-mgs-lightgray">
        <p className="font-orbitron tracking-wider">DAILY DOUGH FLOW :: TACTICAL FINANCE</p>
      </footer>
    </div>
  );
};

export default Index;
