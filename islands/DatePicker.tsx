import { useRef } from "preact/hooks";

interface DatePickerProps {
  initialValue?: string;
}

export default function DatePicker({ initialValue }: DatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const setToday = () => {
    if (dateInputRef.current) {
      const today = new Date();
      dateInputRef.current.value = formatDateForInput(today);
    }
  };

  const setTomorrow = () => {
    if (dateInputRef.current) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInputRef.current.value = formatDateForInput(tomorrow);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={setToday}
          className="btn btn-primary"
        >
          Heute
        </button>
        <button
          type="button"
          onClick={setTomorrow}
          className="btn btn-primary"
        >
          Tomorrow
        </button>
      </div>
      <input
        ref={dateInputRef}
        type="date"
        name="date"
        className="input input-bordered"
        defaultValue={initialValue}
      />
    </div>
  );
}
