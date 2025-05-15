export default function Loading({ message }: { message: React.ReactNode }) {
	return (
		<div className="flex flex-col items-center justify-center">
			<p className="text-zinc-500">loading</p>
			{message}
		</div>
	);
}
