import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  codeSchema,
  SignUpFromValues,
  signUpSchema,
} from "../../../lib/schema/auth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const isLoading = fetchStatus === "fetching";

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFromValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });

  // -------------------------
  // SIGN UP
  // -------------------------
  const onSignUpPress = async (values: SignUpFromValues) => {
    try {
      setEmail(values.email);

      const { error } = await signUp.password({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (error) {
        console.error("Signup error:", JSON.stringify(error, null, 2));
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        console.error(
          "Verification email error:",
          JSON.stringify(verificationError, null, 2)
        );
        return;
      }

      // Only now switch the UI
      setShowVerification(true);
    } catch (error) {
      console.error("Signup exception:", error);
    }
  };

  // -------------------------
  // VERIFY EMAIL
  // -------------------------
  const onVerifyPress = async ({ code }: { code: string }) => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) {
        console.error(
          "Verification error:",
          JSON.stringify(error, null, 2)
        );
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return;
            }

            const url = decorateUrl("/");
            router.replace(url as any);
          },
        });
      } else {
        console.log(
          "Signup is not complete yet:",
          signUp.status
        );
      }
    } catch (error) {
      console.error("Verification exception:", error);
    }
  };

  // -------------------------
  // VERIFICATION SCREEN
  // -------------------------
  if (showVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-brand-body"
      >
        <View className="flex-1 justify-center px-6 -mt-16">
          <Image
            source={require("../../../assets/images/welth.png")}
            className="w-36 h-16 mb-8"
            resizeMode="contain"
          />

          <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight">
            Verify your account
          </Text>

          <Text className="text-brand-text-muted text-base mb-8">
            We sent a code to {email}
          </Text>

          <Controller
            control={codeControl}
            name="code"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                placeholder="Enter verification code"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            )}
          />

          {codeErrors.code && (
            <Text className="text-brand-coral mb-4 text-sm">
              {codeErrors.code.message}
            </Text>
          )}

          {errors.fields.code && (
            <Text className="text-brand-coral mb-4 text-sm">
              {errors.fields.code.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleCodeSubmit(onVerifyPress)}
            disabled={isLoading}
            className="w-full bg-brand-blue py-4 rounded-xl items-center mb-4"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Verify
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const { error } =
                await signUp.verifications.sendEmailCode();

              if (error) {
                console.error(
                  "Resend code error:",
                  JSON.stringify(error, null, 2)
                );
              }
            }}
            disabled={isLoading}
            className="py-2"
          >
            <Text className="text-brand-blue text-sm">
              I need a new code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              signUp.reset();
              setShowVerification(false);
              setEmail("");
            }}
            className="py-2"
          >
            <Text className="text-brand-blue text-sm">
              Start over
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // -------------------------
  // SIGN UP SCREEN
  // -------------------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-brand-body"
    >
      <View className="flex-1 justify-center px-6">
        <Image
          source={require("../../../assets/images/welth.png")}
          className="w-36 h-16 mb-8"
          resizeMode="contain"
        />

        <Text className="text-brand-text-muted text-base mb-2">
          Sign up to start your journey with us!
        </Text>

        <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight">
          Create account
        </Text>

        <Text className="text-brand-text-muted text-base mb-8">
          Track your money, powered by AI
        </Text>

        {/* FIRST + LAST NAME */}
        <View className="flex-row gap-3 mb-2">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="flex-1 border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 text-[#1A1D26]"
                placeholder="First name"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="flex-1 border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 text-[#1A1D26]"
                placeholder="Last name"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />
        </View>

        {(formErrors.firstName || formErrors.lastName) && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.firstName?.message ||
              formErrors.lastName?.message}
          </Text>
        )}

        {/* EMAIL */}
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInput
              className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
              placeholder="Email Address"
              placeholderTextColor="#8A8D96"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          )}
        />

        {formErrors.email && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.email.message}
          </Text>
        )}

        {errors.fields.emailAddress && (
          <Text className="text-brand-coral mb-4 text-sm">
            {errors.fields.emailAddress.message}
          </Text>
        )}

        {/* PASSWORD */}
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <TextInput
              className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
              placeholder="Password"
              placeholderTextColor="#8A8D96"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />

        {formErrors.password && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.password.message}
          </Text>
        )}

        {errors.fields.password && (
          <Text className="text-brand-coral mb-4 text-sm">
            {errors.fields.password.message}
          </Text>
        )}

        {/* SIGN UP BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit(onSignUpPress)}
          disabled={isLoading}
          className="w-full bg-brand-blue py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* SIGN IN */}
        <View className="flex-row justify-center">
          <Text className="text-brand-text-muted">
            Already have an account?{" "}
          </Text>

          <Link href="/sign-in">
            <Text className="text-brand-blue font-semibold">
              Sign In
            </Text>
          </Link>
        </View>

        {/* Clerk bot protection */}
        <View nativeID="clerk-captcha" />
      </View>
    </KeyboardAvoidingView>
  );
}