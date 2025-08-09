import { useRef, useState } from "preact/hooks";

interface DatePickerProps {
  initialValue?: string;
}

export default function DatePicker({ initialValue }: DatePickerProps) {
  console.log("initialValue", initialValue);

  // Format initialValue to be able to display in input
  const formattedInitialValue = initialValue
    ? new Date(initialValue).toISOString().split("T")[0]
    : "";

  const [date, setDate] = useState<string>(formattedInitialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setDate(target.value);
    target.form?.requestSubmit();
  };

  const setToday = () => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    setDate(formattedToday);

    // Update the input value directly and then submit
    if (inputRef.current) {
      inputRef.current.value = formattedToday;
      inputRef.current.form?.requestSubmit();
    }
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split("T")[0];
    setDate(formattedTomorrow);

    // Update the input value directly and then submit
    if (inputRef.current) {
      inputRef.current.value = formattedTomorrow;
      inputRef.current.form?.requestSubmit();
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
        ref={inputRef}
        type="date"
        name="date"
        className="input input-bordered"
        value={date}
        onInput={handleDateChange}
      />
    </div>
  );
}
