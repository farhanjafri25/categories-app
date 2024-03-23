"use client";
import React, { useState } from "react";
import {
	Container,
	Heading,
	VStack,
	FormControl,
	Text,
	Input,
	Button,
	InputGroup,
	InputLeftAddon,
	Card,
	HStack,
	Box,
	useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResponseInterface } from "@/interfaces/response.interface";
import { CONSTANTS } from "@/constants/constants";
import { encryptText } from "@/helpers/encryptText";

export default function Register() {
	const [formBusy, setFormBusy] = useState(false);
	const toast = useToast();
	const router = useRouter();
	async function registerUser(formData: FormData) {
		try {
			setFormBusy(true);
			const email = formData.get("email") || "";
			const password = formData.get("password") || "";
			const confirmPassword = formData.get("confirmPassword") || "";
			if (password !== confirmPassword) {
				toast({
					description: "Passwords do not match",
					status: "error",
				});
				setFormBusy(false);
				return;
			}
			const emailExistsRes = await fetch(
				`/api/auth/register-user?email=${email}`,
				{
					method: "GET",
				}
			);
			const emailsExists: ResponseInterface = await emailExistsRes.json();
			if (!emailsExists.success) {
				toast({
					description: `${emailsExists.message}`,
					status: "error",
				});
				setFormBusy(false);
				return;
			}
			const encryptPasswordText = encryptText(String(password));
			router.replace(
				`/user/auth/otp-verify?email=${email}&password=${encryptPasswordText}`
			);
			return;
		} catch (error) {
			console.log("registerUser ~ error:", error);
			toast({
				description: "Something went wrong",
				status: "error",
			});
			return;
		}
	}

	return (
		<Container py={20} maxW={"2xl"}>
			<Heading size={"xl"} fontWeight={400} textAlign={"center"} mb={12}>
				Register your account
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
					<form action={registerUser}>
						<VStack gap={3}>
							<FormControl id="phone" isRequired>
								<Text fontSize={"sm"} fontWeight={"medium"}>
									Email
								</Text>
								<InputGroup>
									<Input
										isRequired
										placeholder="Email"
										isDisabled={formBusy}
										disabled={formBusy}
										name="email"
									/>
								</InputGroup>
								<Text fontSize={"sm"} fontWeight={"medium"}>
									Password
								</Text>
								<InputGroup>
									<Input
										type={"password"}
										isRequired
										placeholder="Password"
										isDisabled={formBusy}
										disabled={formBusy}
										name="password"
									/>
								</InputGroup>
								<Text fontSize={"sm"} fontWeight={"medium"}>
									Confirm password
								</Text>
								<InputGroup>
									<Input
										type={"password"}
										isRequired
										placeholder="Confirm password"
										isDisabled={formBusy}
										disabled={formBusy}
										name="confirmPassword"
									/>
								</InputGroup>
							</FormControl>
							<Button
								type="submit"
								width={"100%"}
								my={2}
								isLoading={formBusy}
								isDisabled={formBusy}
								disabled={formBusy}>
								Create account
							</Button>
							<Box my={2}>
								<Text textAlign={"center"}>
									Already have and account?{" "}
									<Link
										href={`${CONSTANTS.auth.login.pageUrl}`}
										color={"brand"}>
										Login Here
									</Link>
								</Text>
							</Box>
						</VStack>
					</form>
				</Card>
			</Container>
		</Container>
	);
}
