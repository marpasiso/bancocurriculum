"use client";

import { useState } from "react";

type EmailInputProps = {
	name: string;
	required?: boolean;
};

export function EmailInput({ name, required = false }: EmailInputProps) {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");

	function validateEmail(value: string) {
		const normalizedEmail = value.trim().toLowerCase();

		if (!normalizedEmail) {
			setError(required ? "Informe seu email." : "");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

		if (!emailRegex.test(normalizedEmail)) {
			setError("Informe um email válido.");
			return false;
		}

		setError("");
		return true;
	}

	return (
		<label className="email-field">
		E-mail
		<input
		name={name}
		type="email"
		autoComplete="email"
		inputMode="email"
		maxLength={254}
		placeholder="Informe seu email"
		value={email}
		required={required}
		aria-invalid={Boolean(error)}
		aria-describedby={error ? "candidate-email-error" : undefined}
		onChange={(event) => {
			setEmail(event.target.value);
			validateEmail(event.target.value);
		}}
		onBlur={(event) => {
			validateEmail(event.target.value);
		}}
		/>

		{error ? (
			<span id="candidate-email-error" className="field-error">
			{error}
			</span>
			) : null}
		</label>
		);
}