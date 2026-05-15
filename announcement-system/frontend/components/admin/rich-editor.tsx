"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function RichEditor({ value, onChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="border-b border-white/10 px-4 py-2 text-xs text-white/45">
        Markdown destekli modern editör alanı
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={14}
        className="w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-white/25"
        placeholder="Duyuru içeriğini buraya yazın..."
      />
    </div>
  );
}
