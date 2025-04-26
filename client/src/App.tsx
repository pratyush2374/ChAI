import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Toaster, toast } from "sonner";
import { Search, Send, Sparkles, Loader2, Bot } from "lucide-react";
import Footer from "./components/footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormData {
    question: string;
}

interface ResponseData {
    answer: string;
    relevant_links: string[];
}

const App: React.FC = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        reset,
        handleSubmit,
    } = useForm<FormData>();

    const [response, setResponse] = useState<ResponseData | null>(null);

    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/question`,
                data
            );
            setResponse(response.data.data);
            reset();
        } catch (err) {
            const error = err as AxiosError;

            if (error.response?.status == 429) {
                toast.error("Rate limit exceeded. Please try again later.");
            } else if (error.response?.data) {
                toast.error(
                    (error.response?.data as { detail: string }).detail
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="p-6 flex items-center justify-center border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-orange-500" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                        Ch<b>AI</b>
                    </h1>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-4xl p-6 flex flex-col">
                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 mb-10">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="What would you like to know?"
                            className="text-[12px] md:text-base w-full pl-10 pr-20 py-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            {...register("question", {
                                required: "Please enter a question",
                                maxLength: {
                                    message: "Max length is 100",
                                    value: 100,
                                },
                                minLength: {
                                    message: "Min length is 3",
                                    value: 3,
                                },
                            })}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-[12px] md:text-base px-4 py-2 rounded-md bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                <span>Ask</span>
                            </button>
                        </div>
                    </div>
                    {errors.question && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.question.message}
                        </p>
                    )}
                </form>

                {response && (
                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-gray-800 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Bot className="h-5 w-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-orange-400">
                                AI Response
                            </h2>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 whitespace-pre-wrap">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {response.answer}
                                </ReactMarkdown>
                            </p>
                        </div>

                        {response.relevant_links &&
                            response.relevant_links.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-800">
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                                        Relevant Resources:
                                    </h3>
                                    <ul className="space-y-2">
                                        {response.relevant_links.map(
                                            (link, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-orange-400 hover:text-orange-300 underline flex items-center gap-1"
                                                    >
                                                        {new URL(link).pathname
                                                            .split("/")
                                                            .filter(Boolean)
                                                            .join(" › ")}
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}
                    </div>
                )}
            </main>

            <Toaster position="bottom-center" richColors />
            <Footer />
        </div>
    );
};

export default App;
