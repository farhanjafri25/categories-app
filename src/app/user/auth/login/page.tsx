"use client";
import { CONSTANTS } from "@/constants/constants";
import { ResponseInterface } from "@/interfaces/response.interface";
import {
	Box,
	Button,
	Card,
	Container,
	FormControl,
	Heading,
	Input,
	InputGroup,
	Text,
	useToast,
	VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
	const [formBusy, setFormBusy] = useState(false);
	const toast = useToast();
	const router = useRouter();

	async function loginUser(formData: FormData) {
		try {
			console.log("form data", formData);
			setFormBusy(true);
			const email = formData.get("email") || "";
			const password = formData.get("password") || "";
			console.log({
				email,
				password,
			}); 
			const token = localStorage.getItem("token");
			const headers = new Headers();
			headers.set("Authorization", `Bearer ${token}`);
			const response = await fetch(`${CONSTANTS.auth.login.apiUrl}`, {
				method: "POST",
				body: JSON.stringify({ email, password }),
				headers,
			});

			const result: ResponseInterface = await response.json();
			console.log("loginUser ~ result:", result);
			if (result.success) {
				localStorage.setItem(
					"auth",
					JSON.stringify({
						user_id: result.data?.user_id,
						email: result.data?.email,
					})
				);
				localStorage.setItem("token", result.data?.token);
				router.replace("/user/category");
				return;
			}
			toast({
				description: `${result.message}`,
				status: "error",
			});
			setFormBusy(false);
			return;
		} catch (error) {
			console.log("loginUser ~ error:", error);
			setFormBusy(false);
			toast({
				description: "Unable to login",
				status: "error",
			});
		}
	}
	return (
		<Container py={20} maxW={"2xl"}>
			<Heading size={"xl"} fontWeight={400} textAlign={"center"} mb={12}>
				Login to your account
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
					<form action={loginUser}>
						<VStack gap={3}>
							<FormControl isRequired>
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
							</FormControl>
							<FormControl isRequired>
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
							</FormControl>
							<Button
								type="submit"
								width={"100%"}
								my={2}
								isLoading={formBusy}
								isDisabled={formBusy}
								disabled={formBusy}>
								Continue
							</Button>
							<Box my={2}>
								<Text textAlign={"center"}>
									Don&apos;t have and account?{" "}
									<Link href={"/auth/register"} color={"brand"}>
										Register Here
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
