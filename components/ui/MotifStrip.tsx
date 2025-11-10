type Props = {
  side?: 'left' | 'right';
  color?: string;
};

export const MotifStrip = ({
  side = 'left',
  color = 'white'
}: Props) => {
  const sidePos = side === 'left' ? 'left-0' : 'right-0';
  const sideBgAnchor = side === 'left' ? 'bg-left-top' : 'bg-right-top';
  // Responsive widths for the strip
  const widthClass = 'w-[100px] sm:w-[180px] lg:w-[300px] xl:w-[350px]';
  // Responsive background tile sizes matching widths
  const bgLengthClass =
    'bg-[length:100px_300px] sm:bg-[length:180px_360px] lg:bg-[length:300px_620px] xl:bg-[length:350px_660px]';
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
        className={`${rotateClass} absolute inset-y-0 ${sidePos} ${widthClass} opacity-[0.04] pointer-events-none bg-[url('/images/motif1.png')] bg-repeat-y ${sideBgAnchor} ${bgLengthClass}`}
      />
    </>
  );
};

export default MotifStrip;


