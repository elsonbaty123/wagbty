
'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const [strengthLabel, setStrengthLabel] = React.useState('');

    React.useEffect(() => {
        const password = String(value || '');
        if (!password) {
            setStrength(0);
            setStrengthLabel('');
            return;
        }

        let score = 0;
        if (password.length > 7) score++; // length
        if (/[A-Z]/.test(password)) score++; // uppercase
        if (/[a-z]/.test(password)) score++; // lowercase
        if (/[0-9]/.test(password)) score++; // number
        if (/[^A-Za-z0-9]/.test(password)) score++; // symbol
        
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
          <div className="flex items-center gap-2" dir="ltr">
             <Progress value={strength} className="h-2 w-full" />
             <span className="text-xs text-muted-foreground min-w-[50px] text-right">{strengthLabel}</span>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
