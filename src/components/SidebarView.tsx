import React, { useEffect, useState } from "react";
import { usePluginContext } from "./PluginContext";
import {
	NoteWithDate,
	getFlatFolders,
	getNotesWithDates,
} from "src/parseNotes";
import { SelectFolder } from "./SelectFolder";
import { Agenda } from "./Agenda";

export const SidebarView = () => {
	const { app, plugin } = usePluginContext();

	// State 😓
	const [notesWithDates, setNotesWithDates] = useState<NoteWithDate[]>([]);
	const [selectedFolder, setSelectedFolder] = useState<string>("");
	const [folderNames, setFolderNames] = useState<string[]>([]);
	const [notesToShow, setNotesToShow] = useState<NoteWithDate[]>([]);

	// Handler for getting sidebar data
	const getSidebarData = async () => {
		// Get notesWithDates
		const newNotesWithDates = await getNotesWithDates(
			app.vault.getMarkdownFiles(),
			plugin.settings.uniquePrefixFormat
		);

		// Build flatFolders object
		const flatFolders = getFlatFolders(newNotesWithDates);

		// Set up data for SelectFolder component
		const newFolderNames =
			(flatFolders && Object.keys(flatFolders)).sort() || [];

		// Set up notesToShow
		const newNotesToShow = flatFolders[selectedFolder] || notesWithDates; // Show all notes if no selectedFolder

		// Check if selectedFolder is still in newFolderNames (for handling if a folder gets renamed, etc)
		const newSelectedFolder =
			selectedFolder && !newFolderNames.includes(selectedFolder)
				? "" // Reset if the selectedFolder is no longer in newFolderNames
				: selectedFolder; // Otherwise keep selectedFolder set to its previous value

		// Save data in state
		setNotesWithDates(newNotesWithDates);
		setFolderNames(newFolderNames);
		setSelectedFolder(newSelectedFolder);
		setNotesToShow(newNotesToShow);

		return {
			notesWithDates: newNotesWithDates,
			folderNames: newFolderNames,
			selectedFolder: newSelectedFolder,
			notesToShow: newNotesToShow,
		};
	};

	// Update data when selectedFolder changes
	useEffect(() => {
		const getData = async () => {
			const { notesToShow } = await getSidebarData();

			console.log("🪩 in useEffect getData()", {
				notesToShow,
			});
		};

		getData();
	}, [selectedFolder]);

	// Register update events
	plugin.registerEvent(app.vault.on("create", getSidebarData));
	plugin.registerEvent(app.vault.on("rename", getSidebarData));
	plugin.registerEvent(app.vault.on("delete", getSidebarData));

	return (
		<>
			{/* For debug/development */}
			<button onClick={getSidebarData}>getSidebarData()</button>
			<br />

			{/* SelectFolder dropdown */}
			<SelectFolder
				onSelectFolderChange={setSelectedFolder}
				folderNames={folderNames}
			/>

			{/* List of Notes */}
			<Agenda notesToShow={notesToShow} />
		</>
	);
};