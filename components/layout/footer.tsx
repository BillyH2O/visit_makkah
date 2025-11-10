import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import {
	FacebookIcon,
	InstagramIcon,
	YoutubeIcon,
} from 'lucide-react';
import Button from '../ui/MainButton';
import { footerData } from '@/data';


type StickyFooterProps = React.ComponentProps<'footer'>;

export function Footer({ className, ...props }: StickyFooterProps) {
	return (
		<footer
			className={cn('relative bg-[#000904] lg:h-[420px] h-[820px] w-full flex', className)}
			style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
			{...props}
		>
			<div className="fixed bottom-0 lg:h-[420px] h-[820px] w-full pb-8">
				<div className="sticky top-[calc(100vh-lg:420px)] h-full overflow-y-auto ">
					<div className="relative flex size-full flex-col justify-between gap-12 border-t border-white/15 px-4 py-8 md:px-12">
						<div
							aria-hidden
							className="absolute inset-0 isolate z-0 contain-strict"
						>
							<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
							<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
							<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
						</div>
						<div className="mt-10 flex flex-col justify-center gap-6 lg:flex-row xl:mt-0">
							<AnimatedContainer className="w-full space-y-4 flex flex-col justify-center items-center">
								<Image
									src="/images/dark_makkah_loogo.png"
									alt="Visit Makkah Logo"
									width={120}
									height={120}
									className="h-auto w-32 md:w-24 lg:w-32"
								/>
								<p className="text-muted-foreground mt-8 text-sm md:mt-0 lg:w-42">
									{footerData.description}
								</p>
								<div className="flex gap-2">
									{footerData.socialLinks.map((link) => {
										const IconComponent = {
											FacebookIcon,
											InstagramIcon,
											YoutubeIcon,

										}[link.icon] || FacebookIcon;
										
										return (
											<Button 
												key={link.title}
												size="sm" 
												variant="neutral" 
												blur={true} 
												href={link.href}
												className="w-10 h-10 flex items-center justify-center p-0"
											>
												<IconComponent className="size-4" />
											</Button>
										);
									})}
								</div>
							</AnimatedContainer>
							{footerData.linkGroups.map((group, index) => (
								<AnimatedContainer
									key={group.label}
									delay={0.1 + index * 0.1}
									className="w-full mx-auto "
								>
									<div className="mb-10 md:mb-0">
										<h3 className="text-sm uppercase text-white/80">{group.label}</h3>
										<ul className="text-muted-foreground mt-4 space-y-2  text-sm md:text-xs lg:text-sm">
											{group.links.map((link) => (
												<li key={link.title}>
													<a
														href={link.href}
														className="hover:text-white inline-flex items-center transition-all duration-300 hover:translate-x-1 cursor-pointer"
													>
														{link.title}
													</a>
												</li>
											))}
										</ul>
									</div>
								</AnimatedContainer>
							))}
						</div>
						<div className="text-muted-foreground flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-2 text-sm md:flex-row">
							<p>{footerData.copyright}</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}


type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
	children?: React.ReactNode;
	delay?: number;
};

function AnimatedContainer({
	delay = 0.1,
	children,
	...props
}: AnimatedContainerProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			{...props}
		>
			{children}
		</motion.div>
	);
}
