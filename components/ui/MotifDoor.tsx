type Props = {
  side?: 'left' | 'right';
  color?: string;
};

export const MotifDoor = ({
  side = 'left',
  color = 'white'
}: Props) => {
  const sidePos = side === 'left' ? 'left-0' : 'right-0';
  const sideBgAnchor = side === 'left' ? 'bg-left-top' : 'bg-right-top';
  // Responsive widths for the strip
  const widthClass = 'w-[35px] md:w-[45px] xl:w-[70px]';
  // Responsive background tile sizes matching widths
  const bgLengthClass =
    'bg-[length:35px_300px] md:bg-[length:45px_450px] xl:bg-[length:70px_600px]';
  const rotateClass = side === 'right' ? 'rotate-180' : '';
  const toColorClass = ({
    white: 'to-white',
    black: 'to-black'
  } as Record<string, string>)[color] ?? 'to-white';

  return (
    <>
      <div
        aria-hidden
        className={`bg-gradient-to-t from-transparent ${toColorClass} ${widthClass} h-72 absolute top-0 ${sidePos} z-10`}
      />
      <div
        aria-hidden
        className={`${rotateClass} absolute inset-y-0 ${sidePos} ${widthClass} opacity-[0.50] pointer-events-none bg-[url('/images/motif2.png')] contrast-200 saturate-200 bg-repeat-y ${sideBgAnchor} ${bgLengthClass}`}
      />
    </>
  );
};

export default MotifDoor;


