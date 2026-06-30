import { t } from "@lingui/core/macro";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { generateRandomName, slugify } from "@reactive-resume/utils/string";
import { templates } from "@/dialogs/resume/template/data";
import { orpc } from "@/libs/orpc/client";

export const Route = createFileRoute("/dashboard/templates")({
	component: TemplatesPage,
});

function TemplatesPage() {
	const navigate = useNavigate();

	const { mutate: createResume, isPending } = useMutation(orpc.resume.create.mutationOptions());

	function handleTemplateClick(templateId: string) {
		const randomName = generateRandomName();
		const toastId = toast.loading(t`Creating resume...`);

		createResume(
			{
				name: randomName,
				slug: slugify(randomName),
				tags: [],
			},
			{
				onSuccess: (resume: { id: string } | string) => {
					const resumeId = typeof resume === "string" ? resume : resume.id;
					toast.success(t`Resume created! Redirecting to editor...`, { id: toastId });
					void navigate({
						to: "/builder/$resumeId",
						params: { resumeId },
						search: { template: templateId },
					});
				},
				onError: () => {
					toast.error(t`Failed to create resume. Please try again.`, { id: toastId });
				},
			},
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="font-bold text-3xl">Resume Templates</h1>
				<p className="text-muted-foreground">Choose a professional template to start editing.</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Object.entries(templates).map(([id, template]) => (
					<button
						key={id}
						type="button"
						disabled={isPending}
						onClick={() => handleTemplateClick(id)}
						className="cursor-pointer overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-ring hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<img src={template.imageUrl} alt={template.name} className="aspect-[3/4] w-full object-cover" />
						<div className="p-4">
							<h3 className="font-semibold">{template.name}</h3>
							<p className="mt-1 text-muted-foreground text-sm">{template.tags.slice(0, 3).join(" • ")}</p>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
