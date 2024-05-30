import c from "ansi-colors";
import { dim } from "ansi-colors";
import ejs from "ejs";
import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import licenses from "spdx-license-list";
import packageJson from "./package.json";

c.theme({
	danger: c.red,
	dark: c.dim.gray,
	disabled: c.gray,
	em: c.italic,
	heading: c.bold.underline,
	info: c.cyan,
	muted: c.dim,
	primary: c.blue,
	strong: c.bold,
	success: c.green.bold,
	underline: c.underline,
	warning: c.yellow.underline,
});

prompt.start();
const defaultPluginID = process.cwd().split(path.sep).pop().toLowerCase().replaceAll(" ", "-").replace(/-?obsidian-?/, "");
const answer = await prompts([
	{
		type: () => "text",
		name: "id",
		message: `Enter the plugin ID ${reset("(lowercase, no spaces)")}`,
		initial: defaultPluginID,
		format: (value) => value.toLowerCase().replaceAll(" ", "-").toLowerCase(),
		validate: (value) => value.length > 0 ? true : "Please enter a valid plugin ID",
	},
	{
		type: "text",
		name: "name",
		message: "Enter the plugin name",
		initial: (prev) => prev
			.replace("obsidian-plugin", "")
			.split("-")
			.filter((word) => word.length > 0)
			.map((word) => capitalize(word))
			.join(" "),
	},
	{
		type: "text",
		name: "description",
		message: "Enter the plugin description",
	},
	{
		type: "text",
		name: "author",
		message: "Enter the author name",
	},
	{
		type: "text",
		name: "authorUrl",
		message: "Enter the author URL",
	},
	{
		type: "confirm",
		name: "desktopOnly",
		message: "Is this plugin desktop-only?",
	},
	{
		type: "text",
		name: "fundingUrl",
		message: "Enter the funding URL",
	},
	{
		type: "autocomplete",
		name: "license",
		message: `Choose a license ${reset(dim("(type to filter, ↑ or ↓ to navigate)"))}`,
		initial: "MIT",
		choices: Object.entries(licenses).map(([id, license]) => {
			return {
				value: id,
				title: license.name,
				description: (license.osiApproved && "OSI Approved") || ""
			};
		}),
	}	
],
{
	onCancel: () => {
		console.log(c.warning("❌ Generation cancelled"));
		process.exit(0);
	}
	}
);

const templateFiles = fs.readdirSync("./src", { withFileTypes: true, encoding: "utf-8", recursive: true});

const capitalize = (s) => {
	if (typeof s !== "string") return "";
	return s.charAt(0).toUpperCase() + s.slice(1);
};

const data = {
	name: program.opts().name || "Sample Plugin",
	id: program.opts().name.toLowerCase().replaceAll(" ", "-") || "sample-plugin",
	description: program.opts().description || "This is a sample plugin",
	interfaceName: capitalize(program.opts().name).replaceAll(" ", "") || "SamplePlugin",
	author: {
		url: program.opts().authorUrl || "",
		name: program.opts().author || "Sample Author",
	},
	isDesktopOnly: !!program.opts().desktopOnly || true,
};

if (program.opts().fundingUrl) {
	data.fundingUrl = program.opts().fundingUrl;
}

for (const files of templateFiles) {
	if (files.isFile()) {
		const pathFiles = path.join(files.path, files.name);
		
		const template = fs.readFileSync(pathFiles, { encoding: "utf-8" });
		const processedTemplate = ejs.render(template, {data});
		fs.writeFileSync(pathFiles, processedTemplate, { encoding: "utf-8" });
	}
}

const manifest = fs.readFileSync("./manifest.json", { encoding: "utf-8" });
const processedManifest = ejs.render(manifest, {data});
fs.writeFileSync("manifest.json", processedManifest, { encoding: "utf-8" });
fs.copyFileSync("manifest.json", "manifest-beta.json", { encoding: "utf-8" });


const readme = fs.readFileSync("./README.md", { encoding: "utf-8" });
const processedReadme = ejs.render(readme, {data});
fs.writeFileSync("README.md", processedReadme, { encoding: "utf-8" });

const ci = fs.readFileSync("./.github/workflows/ci.yml", { encoding: "utf-8" });
const processedCi = ejs.render(ci, {data});
fs.writeFileSync(".github/workflows/ci.yml", processedCi, { encoding: "utf-8" });

console.log(c.success("✅ Generated ") + c.info("all files"));

//update package.json
packageJson.author = data.author;
packageJson.name = data.name;
packageJson.license = answer.license;
delete packageJson.scripts.generate;
delete packageJson.devDependencies["@types/ejs"];
delete packageJson.dependencies.ejs;
delete packageJson.dependencies.prompts;
delete packageJson.dependencies["spdx-license-list"];
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2), { encoding: "utf-8" });
