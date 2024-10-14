import { useAtom, type WritableAtom } from "jotai";

interface Props<T> extends Omit<React.ComponentPropsWithRef<'input'>, 'onChange'> {
	atom: WritableAtom<T, [T], void>
};

export default function InputWithAtom<T extends string | number>(
	props: Props<T>,
) {
	const { atom, type, ...rest } = props;
	const [value, setValue] = useAtom(atom);

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		setValue((type === "number" ? ensureNumber(newValue) : newValue) as T);
	};

	const newProps = { ...rest, value, onChange };

	return <input {...newProps} />;
}

const ensureNumber = (input: string): number => {
	const attempt = Number(input);
	return Number.isNaN(attempt) ? 0 : attempt;
};
