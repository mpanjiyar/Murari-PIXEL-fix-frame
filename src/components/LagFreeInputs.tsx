import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface LagFreeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((val: string) => void);
  debounceMs?: number;
}

export const LagFreeInput = forwardRef<HTMLInputElement, LagFreeInputProps>(({
  value,
  onChange,
  debounceMs = 120,
  onBlur,
  onKeyDown,
  ...props
}, ref) => {
  const initialVal = value !== undefined ? value : (props.defaultValue ?? '');
  const [localValue, setLocalValue] = useState<string>(String(initialVal ?? ''));
  const onChangeRef = useRef(onChange);
  const valuePropRef = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (value !== undefined) {
      valuePropRef.current = value;
      setLocalValue(String(value ?? ''));
    }
  }, [value]);

  const flushChange = useCallback((valToFlush: string) => {
    if (valuePropRef.current !== undefined && valToFlush === String(valuePropRef.current ?? '')) return;
    if (!onChangeRef.current) return;

    const fn = onChangeRef.current as any;
    const syntheticEvent: any = {
      target: { value: valToFlush, name: props.name, type: props.type },
      currentTarget: { value: valToFlush, name: props.name, type: props.type },
      preventDefault: () => {},
      stopPropagation: () => {},
      persist: () => {}
    };

    fn(syntheticEvent);
  }, [props.name, props.type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      flushChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, flushChange]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    flushChange(localValue);
    if (onBlur) onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      flushChange(localValue);
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <input
      {...props}
      ref={inputRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
});

LagFreeInput.displayName = 'LagFreeInput';

export interface LagFreeTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: ((e: React.ChangeEvent<HTMLTextAreaElement>) => void) | ((val: string) => void);
  debounceMs?: number;
}

export const LagFreeTextArea = forwardRef<HTMLTextAreaElement, LagFreeTextAreaProps>(({
  value,
  onChange,
  debounceMs = 120,
  onBlur,
  onKeyDown,
  ...props
}, ref) => {
  const initialVal = value !== undefined ? value : (props.defaultValue ?? '');
  const [localValue, setLocalValue] = useState<string>(String(initialVal ?? ''));
  const onChangeRef = useRef(onChange);
  const valuePropRef = useRef(value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => textAreaRef.current as HTMLTextAreaElement);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (value !== undefined) {
      valuePropRef.current = value;
      setLocalValue(String(value ?? ''));
    }
  }, [value]);

  const flushChange = useCallback((valToFlush: string) => {
    if (valuePropRef.current !== undefined && valToFlush === String(valuePropRef.current ?? '')) return;
    if (!onChangeRef.current) return;

    const fn = onChangeRef.current as any;
    const syntheticEvent: any = {
      target: { value: valToFlush, name: props.name },
      currentTarget: { value: valToFlush, name: props.name },
      preventDefault: () => {},
      stopPropagation: () => {},
      persist: () => {}
    };

    fn(syntheticEvent);
  }, [props.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      flushChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, flushChange]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    flushChange(localValue);
    if (onBlur) onBlur(e);
  };

  return (
    <textarea
      {...props}
      ref={textAreaRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
    />
  );
});

LagFreeTextArea.displayName = 'LagFreeTextArea';
