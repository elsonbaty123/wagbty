
'use client';

import * as React from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

const PasswordRequirement = ({ label, met }: { label: string; met: boolean }) => (
    <div className={cn("flex items-center gap-2 justify-end", met ? "text-primary" : "text-muted-foreground")}>
      <span>{label}</span>
      {met ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
    </div>
  );

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const [strengthLabel, setStrengthLabel] = React.useState('');
    const [checks, setChecks] = React.useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
    });

    React.useEffect(() => {
        const password = String(value || '');
        if (!password) {
            setStrength(0);
            setStrengthLabel('');
            setChecks({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                symbol: false,
            });
            return;
        }

        const newChecks = {
          length: password.length > 7,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
          number: /[0-9]/.test(password),
          symbol: /[^A-Za-z0-9]/.test(password),
        };
        setChecks(newChecks);
        
        const score = Object.values(newChecks).filter(Boolean).length;
        
        setStrength((score / 5) * 100);

        if (score <= 2) {
            setStrengthLabel('ضعيفة');
        } else if (score <= 4) {
            setStrengthLabel('متوسطة');
        } else {
            setStrengthLabel('قوية');
        }

    }, [value]);


    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            className={cn('pl-10', className)}
            value={value}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 left-0 flex items-center px-3 text-muted-foreground"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {showStrength && String(value || '').length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2" dir="ltr">
             <Progress value={strength} className="h-2 w-full" />
             <span className="text-xs text-muted-foreground min-w-[50px] text-right">{strengthLabel}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-right">
                <PasswordRequirement label="٨ أحرف على الأقل" met={checks.length} />
                <PasswordRequirement label="حرف كبير" met={checks.uppercase} />
                <PasswordRequirement label="حرف صغير" met={checks.lowercase} />
                <PasswordRequirement label="رقم" met={checks.number} />
                <PasswordRequirement label="رمز" met={checks.symbol} />
            </div>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
