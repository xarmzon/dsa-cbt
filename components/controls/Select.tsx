export interface Options {}

export interface SelectOptionProps {
  text: string;
  value: string;
}

export interface SelectProps {
  name: string;
  required?: boolean;
  default?: SelectOptionProps;
  options: SelectOptionProps[];
  labelClass?: string;
  labelValue?: string;
  showLabel?: boolean;
  error?: boolean;
  onChange: (value) => void;
}

const Select = (props: SelectProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {props.showLabel && (
        <label
          htmlFor={props.name}
          className={`text-sm md:text-md ${props.labelClass} ${
            props.error && "text-red-600"
          }`}
        >
          {props.labelValue}
        </label>
      )}
      <select
        name={props.name}
        required={props.required ? true : false}
        className="bg-gray-200 border-none"
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value={props.default ? props.default.value : ""}>
          {props.default ? props.default.text : "Available options"}
        </option>
        {props.options.length > 0 &&
          props.options.map((op) => (
            <option key={op.value} value={op.value}>
              {op.text}
            </option>
          ))}
      </select>
    </div>
  );
};

export default Select;
