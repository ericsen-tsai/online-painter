import { cn } from '@/utils'
const lineWidth = [1, 3, 5]

function LineWidthSelector({
  width,
  onChange,
  className = '',
}: {
  width: number
  onChange: (w: number) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-28 h-15 flex flex-col gap-3 ring-2 p-2 ring-pink-500 rounded-md bg-white',
        className
      )}
    >
      {lineWidth.map((w) => {
        return (
          <button
            key={w}
            className={cn(
              'flex gap-2 items-center p-3 rounded-md',
              width === w && 'ring-2 ring-gray-500'
            )}
            onClick={() => {
              void onChange(w)
            }}
          >
            <p>{w}px</p>
            <div
              className="flex-1 bg-black"
              style={{
                height: w,
              }}
            ></div>
          </button>
        )
      })}
    </div>
  )
}

export default LineWidthSelector
