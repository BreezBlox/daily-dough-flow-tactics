
import { useState, FormEvent, useId } from "react";
import { EntryType, FinancialEntry, Frequency } from "@/types";
import { formatDateToYYYYMMDD, parseLocalDateString } from "@/utils/dateUtils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface BillFormProps {
  selectedDate: Date;
  onSubmit: (entry: Omit<FinancialEntry, 'id'>) => void;
}

const BillForm: React.FC<BillFormProps> = ({ selectedDate, onSubmit }) => {
  const formId = useId();
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState<number | "">("");
  const [billDueDate, setBillDueDate] = useState(formatDateToYYYYMMDD(selectedDate));
  const [billFrequency, setBillFrequency] = useState<Frequency>("monthly");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!billName || billAmount === "") {
      // TODO: Add proper validation
      return;
    }
    
    onSubmit({
      type: 'bill' as EntryType,
      name: billName,
      amount: typeof billAmount === "number" ? billAmount : parseFloat(String(billAmount)),
      date: parseLocalDateString(billDueDate),
      frequency: billFrequency
    });
    
    // Reset form
    setBillName("");
    setBillAmount("");
    setBillDueDate(formatDateToYYYYMMDD(selectedDate));
    setBillFrequency("monthly");
  };

  return (
    <form id={`bill-form-${formId}`} className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={`billName-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Expenditure ID:
        </label>
        <Input
          id={`billName-${formId}`}
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          placeholder="e.g., Utility Grid Payment"
          className="font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext placeholder:text-mgs-lightgray/50 rounded-none"
        />
      </div>
      
      <div>
        <label htmlFor={`billAmount-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Amount:
        </label>
        <Input
          id={`billAmount-${formId}`}
          type="number"
          step="0.01"
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value ? parseFloat(e.target.value) : "")}
          placeholder="e.g., 45.50"
          className="font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext placeholder:text-mgs-lightgray/50 rounded-none"
        />
      </div>
      
      <div>
        <label htmlFor={`billDueDate-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Due Date:
        </label>
        <Input
          id={`billDueDate-${formId}`}
          type="date"
          value={billDueDate}
          onChange={(e) => setBillDueDate(e.target.value)}
          className="font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext rounded-none"
        />
      </div>
      
      <div>
        <label htmlFor={`billFrequency-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Frequency Protocol:
        </label>
        <select
          id={`billFrequency-${formId}`}
          value={billFrequency}
          onChange={(e) => setBillFrequency(e.target.value as Frequency)}
          className="w-full font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext py-2 px-3 rounded-none"
        >
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="one-time">One-Time</option>
        </select>
      </div>
      
      <Button 
        type="submit" 
        className="w-full font-orbitron bg-mgs-green hover:bg-mgs-darkgreen text-mgs-black uppercase tracking-wider rounded-none border border-mgs-green mt-4"
      >
        Transmit Log
      </Button>
    </form>
  );
};

export default BillForm;
