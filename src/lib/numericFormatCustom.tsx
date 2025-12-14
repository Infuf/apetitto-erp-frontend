import React from "react";
import {type NumberFormatValues, NumericFormat} from "react-number-format";

interface CustomProps {
    onChange: (event: { target: { name: string; value: number | undefined } }) => void;
    name: string;
}

export const NumericFormatCustom = React.forwardRef<HTMLElement, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const {onChange, ...other} = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                thousandSeparator=" "
                decimalScale={2}
                fixedDecimalScale={false}
                allowNegative={false}
                onValueChange={(values: NumberFormatValues) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.floatValue,
                        },
                    });
                }}
                valueIsNumericString
            />
        );
    },
);