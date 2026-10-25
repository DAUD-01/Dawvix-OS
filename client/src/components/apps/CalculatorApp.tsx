import { useState, useEffect, useCallback } from "react";
import { Delete } from "lucide-react";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [storedOperator, setStoredOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev === "0" ? digit : prev + digit));
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  }, [waitingForOperand, display]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setPrevValue(null);
    setStoredOperator(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const toggleSign = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  }, [display]);

  const inputPercent = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
    }
  }, [display]);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [waitingForOperand, display.length]);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
      case "*":
        return a * b;
      case "÷":
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${inputValue} ${nextOperator}`);
    } else if (storedOperator) {
      const result = calculate(prevValue, inputValue, storedOperator);
      if (isNaN(result)) {
        setDisplay("Error");
        setPrevValue(null);
        setStoredOperator(null);
        setWaitingForOperand(true);
        return;
      }
      setPrevValue(result);
      setDisplay(String(Number(result.toFixed(8))));
      setExpression(`${Number(result.toFixed(8))} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setStoredOperator(nextOperator);
  }, [display, prevValue, storedOperator]);

  const performEquals = useCallback(() => {
    if (storedOperator && prevValue !== null) {
      const inputValue = parseFloat(display);
      const result = calculate(prevValue, inputValue, storedOperator);
      if (isNaN(result)) {
        setDisplay("Error");
      } else {
        const formatted = String(Number(result.toFixed(8)));
        setExpression(`${prevValue} ${storedOperator} ${inputValue} =`);
        setDisplay(formatted);
        setPrevValue(null);
        setStoredOperator(null);
        setWaitingForOperand(true);
      }
    }
  }, [storedOperator, prevValue, display]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "=" || e.key === "Enter") {
        e.preventDefault();
        performEquals();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "+") {
        performOperation("+");
      } else if (e.key === "-") {
        performOperation("-");
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "%") {
        inputPercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performEquals, backspace, clearAll, performOperation, inputPercent]);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 select-none p-3 max-w-sm mx-auto justify-between">
      {/* Display Screen */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 text-right flex flex-col justify-end min-h-[96px] shadow-inner">
        <span className="text-xs text-slate-400 font-mono tracking-wider h-5 overflow-hidden">
          {expression}
        </span>
        <div className="text-3xl font-bold font-mono tracking-tight text-white truncate mt-1">
          {display}
        </div>
      </div>

      {/* Button Pad */}
      <div className="grid grid-cols-4 gap-2 pt-3">
        {/* Row 1 */}
        <button
          onClick={clearAll}
          className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-rose-400 font-semibold text-sm transition active:scale-95 cursor-pointer"
        >
          AC
        </button>
        <button
          onClick={clearEntry}
          className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold text-sm transition active:scale-95 cursor-pointer"
        >
          C
        </button>
        <button
          onClick={inputPercent}
          className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold text-sm transition active:scale-95 cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => performOperation("÷")}
          className="h-12 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-lg transition active:scale-95 cursor-pointer"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputDigit("7")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          7
        </button>
        <button
          onClick={() => inputDigit("8")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          8
        </button>
        <button
          onClick={() => inputDigit("9")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          9
        </button>
        <button
          onClick={() => performOperation("×")}
          className="h-12 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-lg transition active:scale-95 cursor-pointer"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit("4")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          4
        </button>
        <button
          onClick={() => inputDigit("5")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          5
        </button>
        <button
          onClick={() => inputDigit("6")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          6
        </button>
        <button
          onClick={() => performOperation("-")}
          className="h-12 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-lg transition active:scale-95 cursor-pointer"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit("1")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          1
        </button>
        <button
          onClick={() => inputDigit("2")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          2
        </button>
        <button
          onClick={() => inputDigit("3")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          3
        </button>
        <button
          onClick={() => performOperation("+")}
          className="h-12 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-lg transition active:scale-95 cursor-pointer"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={toggleSign}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-sm transition active:scale-95 cursor-pointer"
        >
          ±
        </button>
        <button
          onClick={() => inputDigit("0")}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-white font-medium text-base transition active:scale-95 cursor-pointer"
        >
          .
        </button>
        <button
          onClick={performEquals}
          className="h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          =
        </button>
      </div>

      {/* Backspace icon button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={backspace}
          className="text-xs text-slate-500 hover:text-slate-300 p-1.5 flex items-center gap-1 transition"
        >
          <Delete size={14} />
          <span>Backspace</span>
        </button>
      </div>
    </div>
  );
}
