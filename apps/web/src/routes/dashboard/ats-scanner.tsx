import { CheckCircleIcon, FileTextIcon, ScanIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@reactive-resume/ui/components/progress";
import { Combobox } from "@/components/ui/combobox";
import { orpc } from "@/libs/orpc/client";

export const Route = createFileRoute("/dashboard/ats-scanner")({
	component: AtsScannerPage,
});

function AtsScannerPage() {
	const [selectedResume, setSelectedResume] = useState("");
	const [atsScore, setAtsScore] = useState<number | null>(null);

	const [issues, setIssues] = useState<string[]>([]);

	const [recommendations, setRecommendations] = useState<string[]>([]);

	const { data: resumes } = useQuery(
		orpc.resume.list.queryOptions({
			input: {
				tags: [],
				sort: "lastUpdatedAt",
			},
		}),
	);

	const { data: resumeDetails } = useQuery({
		...orpc.resume.getById.queryOptions({
			input: {
				id: selectedResume,
			},
		}),
		enabled: !!selectedResume,
	});

	const resumeOptions =
		resumes?.map((resume) => ({
			value: resume.id,
			label: resume.name,
		})) ?? [];

	const handleScan = () => {
		console.log("Resume Data");
		console.log(resumeDetails?.data);
		if (!resumeDetails?.data) return;

		const resume = resumeDetails.data;

		let score = 100;

		const foundIssues: string[] = [];
		const foundRecommendations: string[] = [];

		// Basics

		if (!resume.basics.name) {
			score -= 10;
			foundIssues.push("Missing full name");
		}

		if (!resume.basics.email) {
			score -= 10;
			foundIssues.push("Missing email");
		}

		if (!resume.basics.phone) {
			score -= 5;
			foundIssues.push("Missing phone number");
		}

		// Experience

		if (!resume.sections?.experience?.items?.length) {
			score -= 20;
			foundIssues.push("No work experience added");

			foundRecommendations.push("Add work experience section");
		}

		// Education

		if (!resume.sections?.skills?.items?.length) {
			score -= 15;
			foundIssues.push("No education section");

			foundRecommendations.push("Add education details");
		}

		// Skills

		if (!resume.sections.skills.items.length) {
			score -= 15;
			foundIssues.push("No skills added");

			foundRecommendations.push("Add relevant technical skills");
		}

		setAtsScore(Math.max(score, 0));
		setIssues(foundIssues);
		setRecommendations(foundRecommendations);
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="flex items-center gap-2 font-bold text-3xl">
					<ScanIcon />
					ATS Scanner
				</h1>

				<p className="text-muted-foreground">Analyze your resume and improve ATS compatibility.</p>
			</div>

			<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="font-semibold text-xl">Resume ATS Score</h2>

							<p className="text-muted-foreground">Select a resume and get instant ATS feedback.</p>
						</div>

						<div className="text-right">
							<p
								className={`font-bold text-5xl ${
									atsScore !== null
										? atsScore >= 80
											? "text-green-500"
											: atsScore >= 60
												? "text-yellow-500"
												: "text-red-500"
										: "text-primary"
								}`}
							>
								{atsScore ?? "--"}
							</p>
							<p className="text-muted-foreground text-sm">Score</p>
						</div>

						{atsScore !== null && (
							<div className="mt-6">
								<Progress value={atsScore}>
									<ProgressTrack>
										<ProgressIndicator />
									</ProgressTrack>
								</Progress>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Select Resume</CardTitle>

					<CardDescription>Choose a resume to scan.</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<Combobox
						value={selectedResume}
						options={resumeOptions}
						placeholder="Select a resume"
						onValueChange={(value) => setSelectedResume(value ?? "")}
					/>

					<Button className="w-full" disabled={!selectedResume} onClick={handleScan}>
						Scan Resume
					</Button>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileTextIcon />
							Keywords
						</CardTitle>
					</CardHeader>

					<CardContent>
						<p className="text-muted-foreground text-sm">Keyword matching analysis will appear here.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<WarningCircleIcon />
							Issues
						</CardTitle>
					</CardHeader>

					<CardContent>
						{issues.length === 0 ? (
							<p className="text-muted-foreground text-sm">No issues found.</p>
						) : (
							<ul className="space-y-2 text-sm">
								{issues.map((issue) => (
									<li key={issue}>• {issue}</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircleIcon />
							Recommendations
						</CardTitle>
					</CardHeader>

					<CardContent>
						{recommendations.length === 0 ? (
							<p className="text-muted-foreground text-sm">No recommendations.</p>
						) : (
							<ul className="space-y-2 text-sm">
								{recommendations.map((item) => (
									<li key={item}>• {item}</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
