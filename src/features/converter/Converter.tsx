import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Hash, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle,
  Binary,
  Code2,
  List
} from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BaseFormats, type BaseType, convertValue, isValidForBase } from '../../utils/converterUtils';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface BaseInputProps {
  label: string;
  value: string;
  icon: React.ElementType;
  onChange: (val: string) => void;
  error?: boolean;
}

const BaseInput: React.FC<BaseInputProps> = ({ label, value, icon: Icon, onChange, error }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value || value === 'Error') return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <label className="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          {label}
        </label>
        <button 
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            copied ? "text-emerald-400 bg-emerald-400/10" : "text-gray-500 hover:text-white hover:bg-white/5"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={cn(
            "w-full bg-[#0f0f0f] border border-white/5 rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 text-lg lg:text-xl font-mono text-white placeholder-gray-700 focus:outline-none focus:ring-2 transition-all",
            error ? "border-red-500/50 focus:ring-red-500/20" : "focus:border-white/20 focus:ring-white/5"
          )}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
        {error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

const Converter: React.FC = () => {
  const [values, setValues] = useState<Record<BaseType, string>>({
    DECIMAL: '',
    HEXADECIMAL: '',
    BINARY: '',
    OCTAL: '',
  });
  const [errorBase, setErrorBase] = useState<BaseType | null>(null);

  const handleInputChange = (baseKey: BaseType, val: string) => {
    const baseVal = BaseFormats[baseKey];
    
    if (!isValidForBase(val, baseVal)) {
      setErrorBase(baseKey);
      setValues(prev => ({ ...prev, [baseKey]: val }));
      return;
    }

    setErrorBase(null);
    const results = convertValue(val, baseVal);
    setValues(results);
  };

  const handleReset = () => {
    setValues({
      DECIMAL: '',
      HEXADECIMAL: '',
      BINARY: '',
      OCTAL: '',
    });
    setErrorBase(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 lg:space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-12">
        <div>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">Number Converter</h2>
          <p className="text-gray-400 text-sm lg:text-base">Convert between numerical bases in real-time with instant precision.</p>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-gray-300 hover:text-white w-full md:w-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <BaseInput 
          label="Decimal" 
          value={values.DECIMAL} 
          icon={Hash}
          onChange={(val) => handleInputChange('DECIMAL', val)}
          error={errorBase === 'DECIMAL'}
        />
        <BaseInput 
          label="Hexadecimal" 
          value={values.HEXADECIMAL} 
          icon={Code2}
          onChange={(val) => handleInputChange('HEXADECIMAL', val)}
          error={errorBase === 'HEXADECIMAL'}
        />
        <BaseInput 
          label="Binary" 
          value={values.BINARY} 
          icon={Binary}
          onChange={(val) => handleInputChange('BINARY', val)}
          error={errorBase === 'BINARY'}
        />
        <BaseInput 
          label="Octal" 
          value={values.OCTAL} 
          icon={List}
          onChange={(val) => handleInputChange('OCTAL', val)}
          error={errorBase === 'OCTAL'}
        />
      </div>

      {/* Info Card */}
      <div className="mt-12 p-6 lg:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          Conversion Tips
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 font-medium">
          <li className="flex gap-2">
            <span className="text-white/20">•</span>
            Decimal: Standard base-10 numbering system.
          </li>
          <li className="flex gap-2">
            <span className="text-white/20">•</span>
            Hexadecimal: Base-16 system often used in development.
          </li>
          <li className="flex gap-2">
            <span className="text-white/20">•</span>
            Binary: Base-2 system representing bits (0 and 1).
          </li>
          <li className="flex gap-2">
            <span className="text-white/20">•</span>
            Octal: Base-8 system using digits 0-7.
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default Converter;
