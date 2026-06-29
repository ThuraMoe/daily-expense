import { useMask } from "@/context/MaskContext";

interface MaskedAmountProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MaskedAmount
 *
 * Wraps a currency amount and applies a blur when the global mask toggle is on.
 * Drop this around any displayed $ value — it reads masked state from MaskContext
 * automatically.
 *
 * @param {MaskedAmountProps} props
 */
const MaskedAmount = ({ children, className = "" }: MaskedAmountProps) => {
  const { masked } = useMask();
  return (
    <span className={`${masked ? "blur-sm select-none" : ""} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default MaskedAmount;
