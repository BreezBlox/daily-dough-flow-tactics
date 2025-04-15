
import { useState, FormEvent, useId } from "react";
import { EntryType, FinancialEntry, Frequency } from "@/types";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface PaycheckFormProps {
  selectedDate: Date;
  onSubmit: (entry: Omit<FinancialEntry, 'id'>) => void;
}

const PaycheckForm: React.FC<PaycheckFormProps> = ({ selectedDate, onSubmit }) => {
  const formId = useId();
  const [paycheckName, setPaycheckName] = useState("");
  const [paycheckAmount, setPaycheckAmount] = useState<number | "">("");
  const [paycheckFrequency, setPaycheckFrequency] = useState<Frequency>("bi-weekly");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!paycheckName || paycheckAmount === "") {
      // TODO: Add proper validation
      return;
    }
    
    onSubmit({
      type: 'paycheck' as EntryType,
      name: paycheckName,
      amount: typeof paycheckAmount === "number" ? paycheckAmount : parseFloat(String(paycheckAmount)),
      date: selectedDate,
      frequency: paycheckFrequency
    });
    
    // Reset form
    setPaycheckName("");
    setPaycheckAmount("");
    setPaycheckFrequency("bi-weekly");
  };

  return (
    <form id={`paycheck-form-${formId}`} className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={`paycheckName-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Acquisition Source:
        </label>
        <Input
          id={`paycheckName-${formId}`}
          value={paycheckName}
          onChange={(e) => setPaycheckName(e.target.value)}
          placeholder="e.g., Outer Heaven Contract"
          className="font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext placeholder:text-mgs-lightgray/50 rounded-none"
        />
      </div>
      
      <div>
        <label htmlFor={`paycheckAmount-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Amount:
        </label>
        <Input
          id={`paycheckAmount-${formId}`}
          type="number"
          step="0.01"
          value={paycheckAmount}
          onChange={(e) => setPaycheckAmount(e.target.value ? parseFloat(e.target.value) : "")}
          placeholder="e.g., 500.00"
          className="font-roboto-mono bg-mgs-darkgray border-mgs-gray text-mgs-lightertext placeholder:text-mgs-lightgray/50 rounded-none"
        />
      </div>
      
      <div>
        <label htmlFor={`paycheckFrequency-${formId}`} className="font-medium uppercase text-sm text-mgs-lightgray block mb-1">
          Frequency Protocol:
        </label>
        <select
          id={`paycheckFrequency-${formId}`}
          value={paycheckFrequency}
          onChange={(e) => setPaycheckFrequency(e.target.value as Frequency)}
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

export default PaycheckForm;
