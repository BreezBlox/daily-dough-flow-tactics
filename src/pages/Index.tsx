
import { useState, useEffect } from "react";
import BarGraph from "@/components/BarGraph";
import Calendar from "@/components/Calendar";
import BillForm from "@/components/BillForm";
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
  
  // Calculate start/end dates for the current month
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  
  // Handle form submission
  const handleEntrySubmit = (newEntry: Omit<FinancialEntry, 'id'>) => {
    const entryWithId: FinancialEntry = {
      ...newEntry,
      id: uuidv4()
    };
    
    setEntries(prevEntries => [...prevEntries, entryWithId]);
  };
  
  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };
  
  // Calculate reserves when entries change
  useEffect(() => {
    // Calculate all recurring entries for the current month
    const recurringEntries = calculateRecurringEntries(entries, startDate, endDate);
    
    // Calculate daily reserves
    const dailyReserves = calculateDailyReserves(recurringEntries, startDate, endDate);
    
    setReserves(dailyReserves);
  }, [entries, startDate, endDate]);
  
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
    <div className="min-h-screen bg-mgs-black p-4 md:p-8">
      <header className="text-center border-b border-mgs-green pb-4 mb-6">
        <h1 className="text-4xl font-orbitron text-mgs-green tracking-wider">Daily Dough Flow</h1>
        <p className="font-orbitron text-mgs-lightgray mt-1 text-xs tracking-widest">// TACTICAL FINANCE MANAGEMENT //</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel - Bar Graph */}
        <div className="w-full md:w-3/5 bg-opacity-30 border border-mgs-green p-4 animate-fade-in">
          <h2 className="font-orbitron text-lg text-center mb-4 pb-2 border-b border-mgs-green">
            Monthly Reserve Forecast
          </h2>
          <BarGraph reserves={reserves} />
          
          <div className="mt-6">
            <h3 className="font-orbitron text-mgs-green text-sm mb-3 border-b border-mgs-gray pb-2">Operations Log</h3>
            <EntryList 
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        </div>
        
        {/* Right Panel - Forms */}
        <div className="w-full md:w-2/5 bg-opacity-30 border border-mgs-green p-4 animate-fade-in">
          <h2 className="font-orbitron text-lg text-center mb-4 pb-2 border-b border-mgs-green">
            Intel Input Terminal
          </h2>
          
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
