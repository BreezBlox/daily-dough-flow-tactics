
import { useState } from "react";
import { FinancialEntry } from "@/types";
import { formatDateToMonthDayYear } from "@/utils/dateUtils";
import { Button } from "./ui/button";
import { Trash2, Edit } from "lucide-react";

interface EntryListProps {
  entries: FinancialEntry[];
  onDeleteEntry: (id: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onDeleteEntry }) => {
  const [activeTab, setActiveTab] = useState<'bills' | 'paychecks' | 'all'>('all');
  
  const filteredEntries = 
    activeTab === 'all' ? entries : 
    activeTab === 'bills' ? entries.filter(entry => entry.type === 'bill') :
    entries.filter(entry => entry.type === 'paycheck');
  
  return (
    <div>
      <div className="flex justify-center gap-1 mb-4 border-b border-mgs-gray pb-2">
        <button 
          className={`px-3 py-1 text-sm font-orbitron ${activeTab === 'all' ? 'bg-mgs-green text-mgs-black' : 'bg-mgs-darkgray text-mgs-lightgray'}`}
          onClick={() => setActiveTab('all')}
        >
          All Entries
        </button>
        <button 
          className={`px-3 py-1 text-sm font-orbitron ${activeTab === 'bills' ? 'bg-mgs-green text-mgs-black' : 'bg-mgs-darkgray text-mgs-lightgray'}`}
          onClick={() => setActiveTab('bills')}
        >
          Expenditures
        </button>
        <button 
          className={`px-3 py-1 text-sm font-orbitron ${activeTab === 'paychecks' ? 'bg-mgs-green text-mgs-black' : 'bg-mgs-darkgray text-mgs-lightgray'}`}
          onClick={() => setActiveTab('paychecks')}
        >
          Acquisitions
        </button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredEntries.length === 0 ? (
          <div className="text-center text-mgs-lightgray py-4 border border-mgs-gray bg-mgs-darkgray/30">
            No entries found
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div 
              key={entry.id} 
              className={`p-3 border ${entry.type === 'bill' ? 'border-mgs-red/50' : 'border-mgs-green/50'} bg-mgs-darkgray/30`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`font-orbitron text-sm ${entry.type === 'bill' ? 'text-mgs-red' : 'text-mgs-green'}`}>
                    {entry.name}
                  </div>
                  <div className="text-xs text-mgs-lightgray mt-1">
                    {formatDateToMonthDayYear(entry.date)} • {entry.frequency}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`font-orbitron mr-4 ${entry.type === 'bill' ? 'text-mgs-red' : 'text-mgs-green'}`}>
                    {entry.type === 'bill' ? '-' : '+'}{entry.amount.toFixed(2)}
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none hover:bg-mgs-green/20"
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntryList;
