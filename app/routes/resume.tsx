import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import EnhancedResume from "~/components/EnhancedResume";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv, ai } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [enhancedContent, setEnhancedContent] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);
            setResumeData(data);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });

            // Load existing enhanced content if available
            const enhanced = await kv.get(`enhanced:${id}`);
            if (enhanced) {
                setEnhancedContent(enhanced);
            }
        }

        loadResume();
    }, [id]);

    const handleEnhance = async () => {
        if (!resumeData) return;

        setIsEnhancing(true);
        setEnhancedContent('');

        try {
            const jobContext = `Job Title: ${resumeData.jobTitle}\nCompany: ${resumeData.companyName}\nJob Description: ${resumeData.jobDescription}`;

            const response = await ai.enhance(
                resumeData.resumePath,
                jobContext
            );

            if (!response) {
                console.error("No response from AI enhance");
                return;
            }

            const content = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            setEnhancedContent(content);

            // Persist to KV store
            await kv.set(`enhanced:${id}`, content);
            console.log("Enhanced resume saved");
        } catch (err) {
            console.error("Enhancement failed:", err);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />

                            {/* Divider */}
                            <hr className="border-gray-200" />

                            {/* Enhancement Section */}
                            <EnhancedResume
                                content={enhancedContent}
                                isLoading={isEnhancing}
                                onEnhance={handleEnhance}
                            />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume

