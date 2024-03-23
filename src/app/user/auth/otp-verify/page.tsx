"use client";
import { CONSTANTS } from "@/constants/constants";
import { decryptText } from "@/helpers/encryptText";
import { ResponseInterface } from "@/interfaces/response.interface";
import {
	Button,
	Card,
	Container,
	Heading,
	HStack,
	Link,
	PinInput,
	PinInputField,
	Text,
	Toast,
	VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { FormEvent, useState } from "react";
interface propsInterface {
	params: {};
	searchParams: {
		email: string;
		password: string;
	};
}

export default function OTPverify({ searchParams }: propsInterface) {
	console.log("OTPverify ~ searchParams:", searchParams);
	const [formBusy, setFormBusy] = useState(false);
	const router = useRouter();
	const email = searchParams.email;
	const encryptedPassword = searchParams.password;

	async function saveUserDetails(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		console.log({
			email,
			encryptedPassword,
		});
		const decryptPassword = decryptText(String(encryptedPassword));
		console.log({
			email,
			decryptPassword,
		});
		if (!email || !decryptPassword) {
			Toast({
				description: "All fields are required",
				status: "error",
			});
			setFormBusy(false);
			return;
		}
		const response = await fetch(`${CONSTANTS.auth.register.apiUrl}`, {
			method: "POST",
			body: JSON.stringify({ email, password: decryptPassword }),
		});
		const result: ResponseInterface = await response.json();
		console.log("registerUser ~ result:", result);
		if (result.success) {
			localStorage.setItem(
				"auth",
				JSON.stringify({
					user_id: result.data?.user_id,
					email: result.data?.email,
				})
			);
			localStorage.setItem("token", result.data?.token);
			router.replace(`${CONSTANTS.category.pageUrl}`);
			return;
		}
		Toast({
			description: `${result.message}`,
			status: "error",
		});
		setFormBusy(false);
		return;
	}

	return (
		<Container py={20} maxW={"2xl"}>
			<Heading size={"xl"} fontWeight={400} textAlign={"center"} mb={20}>
				We have sent an OTP to your email
			</Heading>
			<Container maxW={450}>
				<Card
					bg={"white"}
					rounded={"xl"}
					maxW={450}
					p={8}
					border={"1px"}
					borderColor={"gray.200"}
					shadow={"none"}>
					<Text fontSize={"md"} mb={2} fontWeight={"medium"}>
						Verification code
					</Text>
					<VStack gap={5} alignItems={"start"}>
						<form onSubmit={(e) => saveUserDetails(e)}>
							<HStack>
								<PinInput otp size="lg">
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
									<PinInputField borderRadius={12} />
								</PinInput>
							</HStack>
							<Button
								width={"100%"}
								type="submit"
								my={2}
								isLoading={formBusy}
								isDisabled={formBusy}
								disabled={formBusy}>
								Continue
							</Button>
						</form>
					</VStack>
				</Card>
			</Container>
		</Container>
	);
}
