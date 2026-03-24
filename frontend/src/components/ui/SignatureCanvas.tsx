"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SignatureCanvas({ onSave, className, disabled = false }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getPoint = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const point = getPoint(e);
      if (!point) return;

      setIsDrawing(true);
      setIsEmpty(false);
      lastPoint.current = point;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
    },
    [disabled]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      e.preventDefault();

      const point = getPoint(e);
      if (!point) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !lastPoint.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPoint.current = point;
    },
    [isDrawing, disabled]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }, []);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }, [isEmpty, onSave]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className={cn(
            "w-full border-2 border-dashed border-gray-300 rounded-xl bg-white touch-none",
            "cursor-crosshair",
            disabled && "opacity-50 cursor-not-allowed",
            !isEmpty && "border-blue-300"
          )}
          style={{ height: "200px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Signez ici avec votre souris ou doigt</p>
          </div>
        )}
        {/* Signature line */}
        <div className="absolute bottom-8 left-6 right-6 border-b border-gray-300 pointer-events-none" />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || isEmpty}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-40"
        >
          <Trash2 size={14} />
          Effacer
        </button>
        <button
          type="button"
          onClick={save}
          disabled={disabled || isEmpty}
          className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
        >
          Valider ma signature
        </button>
      </div>
    </div>
  );
}
