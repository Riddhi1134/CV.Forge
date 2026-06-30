import type { Template } from "@reactive-resume/schema/templates";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, ChatCircleDotsIcon, FilePlusIcon, SparkleIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@reactive-resume/ui/components/button";
import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
import { cn } from "@reactive-resume/utils/style";
import { templates } from "@/dialogs/resume/template/data";
import { orpc } from "@/libs/orpc/client";
import { AgentThreadSidebar } from "./-components/thread-sidebar";

export const Route = createFileRoute("/agent/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [showTemplates, setShowTemplates] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

	const { mutate: createThread, isPending } = useMutation(orpc.agent.threads.create.mutationOptions());

	function handleTemplateSelect(template: Template) {
		setSelectedTemplate(template);
	}

	function handleCreateWithTemplate() {
		if (!selectedTemplate) return;
		const payload = { sourceResumeId: selectedTemplate };
		createThread(payload, {
			onSuccess: (thread) => {
				void navigate({ to: "/agent/$threadId", params: { threadId: thread.id } });
			},
			onError: () => toast.error("Failed to create thread."),
		});
	}

	if (showTemplates) {
		return (
			<div className="flex h-svh bg-background">
				<div className="w-72 shrink-0">
					<AgentThreadSidebar />
				</div>
				<main className="flex min-w-0 flex-1 flex-col p-6">
					<div className="mb-6">
						<button
							type="button"
							onClick={() => {
								setShowTemplates(false);
								setSelectedTemplate(null);
							}}
							className="mb-4 text-muted-foreground text-sm hover:text-foreground"
						>
							← Back
						</button>
						<h1 className="font-semibold text-2xl tracking-tight">
							<Trans>Choose a Template</Trans>
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							<Trans>Select a template to start building your resume from scratch with AI.</Trans>
						</p>
					</div>

					<ScrollArea className="flex-1">
						<div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{Object.entries(templates).map(([id, metadata]) => (
								<button
									key={id}
									type="button"
									onClick={() => handleTemplateSelect(id as Template)}
									className={cn(
										"group relative flex flex-col gap-2 rounded-lg border-2 bg-card p-2 text-left transition-all hover:shadow-md",
										selectedTemplate === id
											? "border-primary ring-2 ring-primary ring-offset-2"
											: "border-transparent hover:border-primary/30",
									)}
								>
									<div className="aspect-[210/297] w-full overflow-hidden rounded-md bg-muted">
										<img src={metadata.imageUrl} alt={metadata.name} className="size-full object-cover" />
									</div>
									<span className="text-center font-medium text-sm">{metadata.name}</span>
									{selectedTemplate === id && (
										<div className="absolute top-2 right-2 rounded-full bg-primary p-1">
											<ArrowRightIcon className="size-3 text-primary-foreground" />
										</div>
									)}
								</button>
							))}
						</div>
					</ScrollArea>

					<div className="mt-4 flex justify-end border-t pt-4">
						<Button disabled={!selectedTemplate || isPending} onClick={handleCreateWithTemplate}>
							{isPending ? (
								"Creating…"
							) : (
								<>
									<SparkleIcon />
									<Trans>Start with this template</Trans>
								</>
							)}
						</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="flex h-svh bg-background">
			<div className="w-72 shrink-0">
				<AgentThreadSidebar />
			</div>
			<main className="grid min-w-0 flex-1 place-items-center p-6">
				<div className="w-full max-w-2xl space-y-4">
					<div className="text-center">
						<h1 className="font-semibold text-2xl tracking-tight">
							<Trans>What would you like to do?</Trans>
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							<Trans>Choose an option to get started.</Trans>
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						{/* Card 1 — Start New Thread */}
						<div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
							<div className="grid size-11 shrink-0 place-items-center rounded-md border bg-background">
								<ChatCircleDotsIcon className="size-5" weight="fill" />
							</div>
							<div className="mt-4 flex-1 space-y-1">
								<h2 className="font-semibold text-lg">
									<Trans>Start New Thread</Trans>
								</h2>
								<p className="text-muted-foreground text-sm">
									<Trans>Continue with an existing resume or start a fresh AI-assisted chat session.</Trans>
								</p>
							</div>
							<div className="mt-6 border-t pt-4">
								<Button className="w-full" nativeButton={false} render={<Link to="/agent/new" />}>
									<ArrowRightIcon />
									<Trans>Continue</Trans>
								</Button>
							</div>
						</div>

						{/* Card 2 — Create New Resume */}
						<div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
							<div className="grid size-11 shrink-0 place-items-center rounded-md border bg-background">
								<FilePlusIcon className="size-5" weight="fill" />
							</div>
							<div className="mt-4 flex-1 space-y-1">
								<h2 className="font-semibold text-lg">
									<Trans>Create New Resume</Trans>
								</h2>
								<p className="text-muted-foreground text-sm">
									<Trans>Pick a template and let AI build your resume from scratch in a new thread.</Trans>
								</p>
							</div>
							<div className="mt-6 border-t pt-4">
								<Button className="w-full" variant="outline" onClick={() => setShowTemplates(true)}>
									<SparkleIcon />
									<Trans>Choose Template</Trans>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
