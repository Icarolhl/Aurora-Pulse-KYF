"use client"

import { useState } from "react"
import clsx from "clsx"

type Props = {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export default function DynamicTagInput({
  tags,
  onChange,
  placeholder,
  className
}: Props) {
  const [inputValue, setInputValue] = useState("")

  const handleAddTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const removeTag = (index: number) => {
    const updated = tags.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-black text-white text-sm px-2 py-1 rounded
             flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-xs text-white hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        className={clsx("w-full border p-2 rounded", className)}
        placeholder={placeholder || "Digite e pressione Enter"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
