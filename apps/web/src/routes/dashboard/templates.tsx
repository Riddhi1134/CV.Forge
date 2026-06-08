import { createFileRoute } from "@tanstack/react-router";
import { templates } from "@/dialogs/resume/template/data";

export const Route = createFileRoute("/dashboard/templates")({
	component: TemplatesPage,
});

function TemplatesPage() {
	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="font-bold text-3xl">Resume Templates</h1>

				<p className="text-muted-foreground">Choose a professional template for your resume.</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Object.entries(templates).map(([id, template]) => (
					<div key={id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
						<img src={template.imageUrl} alt={template.name} className="aspect-[3/4] w-full object-cover" />

						<div className="p-4">
							<h3 className="font-semibold">{template.name}</h3>

							<p className="mt-1 text-muted-foreground text-sm">{template.tags.slice(0, 3).join(" • ")}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
