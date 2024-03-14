import ejs from "ejs";
import fs from "fs";

const templateFiles = fs.readdirSync("./src");

interface PluginData {
	name: string;
	id: string;
	description: string;
	interfaceName: string;
}

const pluginData: PluginData = {
	name: "Sample Plugin",
	id: "sample-plugin",
	description: "This is a sample plugin",
	interfaceName: "SamplePlugin"
};

for (const files of templateFiles) {
	const processedTemplate = ejs.render(fs.readFileSync(`./src/${files}`, "utf-8"), pluginData);
	fs.writeFileSync(`./src/${files}`, processedTemplate, "utf-8");
	console.log("Generated: ", files);
}
