import {App, ButtonComponent, PluginSettingTab, Setting} from "obsidian";
import {i18nConfig} from "../lang/I18n";
import ObsidianSyncNotionPlugin from "../main";
import {SettingModal} from "./settingModal";
import {SettingNextTabs} from "./settingNextTabs";
import {SettingGeneralTabs} from "./settingGeneralTabs";
import {set} from "yaml/dist/schema/yaml-1.1/set";

export interface PluginSettings {
    NextButton: boolean;
    notionAPINext: string;
    databaseIDNext: string;
    bannerUrl: string;
    notionUser: string;
    proxy: string;
    GeneralButton: boolean;
    tagButton: boolean;
    CustomTitleButton: boolean;
    CustomTitleName: string;
    notionAPIGeneral: string;
    databaseIDGeneral: string;
    CustomButton: boolean;
    CustomValues: string;
    notionAPICustom: string;
    databaseIDCustom: string;
    [key: string]: any;
	databaseDetails: Record<string, DatabaseDetails>
}

export interface DatabaseDetails {
	format: string;
	fullName: string;
	abName: string;
	notionAPI: string;
	databaseID: string;
	tagButton: boolean;
	customTitleButton: boolean;
	customTitleName: string;
	// customValues: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    NextButton: true,
    notionAPINext: "",
    databaseIDNext: "",
    bannerUrl: "",
    notionUser: "",
    proxy: "",
    GeneralButton: true,
    tagButton: true,
    CustomTitleButton: false,
    CustomTitleName: "",
    notionAPIGeneral: "",
    databaseIDGeneral: "",
    CustomButton: false,
    CustomValues: "",
    notionAPICustom: "",
    databaseIDCustom: "",
	databaseDetails: {},
};


export class ObsidianSettingTab extends PluginSettingTab {
    plugin: ObsidianSyncNotionPlugin;
	databaseEl: HTMLDivElement;

    constructor(app: App, plugin: ObsidianSyncNotionPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // General Settings
        containerEl.createEl('h2', { text: i18nConfig.GeneralSetting });

        this.createSettingEl(containerEl, i18nConfig.BannerUrl, i18nConfig.BannerUrlDesc, 'text', i18nConfig.BannerUrlText, this.plugin.settings.bannerUrl, 'bannerUrl')

        this.createSettingEl(containerEl, i18nConfig.NotionUser, i18nConfig.NotionUserDesc, 'text', i18nConfig.NotionUserText, this.plugin.settings.notionUser, 'notionUser')



		// add new button

		new Setting(containerEl)
			.setName("Add New Database")
			.setDesc("Add New Database")
			.addButton((button: ButtonComponent): ButtonComponent => {
				return button
					.setTooltip("Add New Database")
					.setIcon("plus")
					.onClick(async () => {
						let modal = new SettingModal(this.app, this.plugin, this);

						modal.onClose = () => {
							if (modal.data.saved) {
								const dbDetails = {
									format: modal.data.databaseFormat,
									fullName: modal.data.databaseFullName,
									abName: modal.data.databaseAbbreviateName,
									notionAPI: modal.data.notionAPI,
									databaseID: modal.data.databaseID,
									tagButton: modal.data.tagButton,
									customTitleButton: modal.data.customTitleButton,
									customTitleName: modal.data.customTitleName,
									// customValues: modal.data.customValues,
								}

								this.plugin.addDatabaseDetails(dbDetails);

								this.plugin.commands.updateCommand();

								this.display()
							}
						}

						modal.open();
					});
			});

		// new section to display all created database
		containerEl.createEl('h2', {text: "Database List"});

		this.databaseEl = containerEl.createDiv('database-list');
		// list all created database
		this.showDatabase();





		// // notion next database settings
		//
		// const NextTabs = new SettingNextTabs(this.app, this.plugin, this);
		//
		// NextTabs.display();
		//
		//
        // // General Database Settings
		// const GeneralTabs = new SettingGeneralTabs(this.app, this.plugin, this);
		//
		// GeneralTabs.display();


        // Custom Database Settings

        // containerEl.createEl('h2', {text: i18nConfig.NotionCustomSettingHeader});
        //
        // new Setting(containerEl)
        // 	.setName(i18nConfig.NotionCustomButton)
        // 	.setDesc(i18nConfig.NotionCustomButtonDesc)
        // 	.addToggle((toggle) =>
        // 		toggle
        // 			.setValue(this.plugin.settings.CustomButton)
        // 			.onChange(async (value) => {
        // 				this.plugin.settings.CustomButton = value;
        // 				await this.plugin.saveSettings();
        // 			})
        // 	);
    }

    // create a function to create a div with a style for pop over elements
    public createStyleDiv(className: string, commandValue: boolean = false) {
        return this.containerEl.createDiv(className, (div) => {
            this.updateSettingEl(div, commandValue);
        });
    }
    // update the setting display style in the setting tab
    public updateSettingEl(element: HTMLElement, commandValue: boolean) {
        element.style.borderTop = commandValue ? "1px solid var(--background-modifier-border)" : "none";
        element.style.paddingTop = commandValue ? "0.75em" : "0";
        element.style.display = commandValue ? "block" : "none";
        element.style.alignItems = "center";
    }

    // function to add one setting element in the setting tab.
    public createSettingEl(containerEl: HTMLElement, name: string, desc: string, type: string, placeholder: string, holderValue: any, settingsKey: string) {
        if (type === 'password') {
            return new Setting(containerEl)
                .setName(name)
                .setDesc(desc)
                .addText((text) => {
                    text.inputEl.type = type;
                    return text
                        .setPlaceholder(placeholder)
                        .setValue(holderValue)
                        .onChange(async (value) => {
                            this.plugin.settings[settingsKey] = value; // Update the plugin settings directly
                            await this.plugin.saveSettings();
                        })
                });
        } else if (type === 'toggle') {
            return new Setting(containerEl)
                .setName(name)
                .setDesc(desc)
                .addToggle((toggle) =>
                    toggle
                        .setValue(holderValue)
                        .onChange(async (value) => {
                            this.plugin.settings[settingsKey] = value; // Update the plugin settings directly
                            await this.plugin.saveSettings();
                            await this.plugin.commands.updateCommand();
                        })
                );
        } else if (type === 'text') {
            return new Setting(containerEl)
                .setName(name)
                .setDesc(desc)
                .addText((text) =>
                    text
                        .setPlaceholder(placeholder)
                        .setValue(holderValue)
                        .onChange(async (value) => {
                            this.plugin.settings[settingsKey] = value; // Update the plugin settings directly
                            await this.plugin.saveSettings();
                            await this.plugin.commands.updateCommand();
                        })
                );
        }
    }

	// function to show all the database details
	showDatabase() {
		this.databaseEl.empty();

		for (let key in this.plugin.settings.databaseDetails) {
			let dbDetails = this.plugin.settings.databaseDetails[key];

			const databaseDiv = this.databaseEl.createDiv('database-div');

			let settingEl = new Setting(databaseDiv)
				.setName(`${dbDetails.fullName} (${dbDetails.abName})`)
				.setDesc(dbDetails.format)


				// add a button for preview data
				// settingEl
				// .addButton((button: ButtonComponent): ButtonComponent => {
				// 	return button
				// 		.setTooltip("Preview Database")
				// 		.setIcon("eye")
				// 		.onClick(async () => {
				// 			this.plugin.previewDatabase(dbDetails);
				// 		});
				// });

				// settingEl
				// .addButton((button: ButtonComponent): ButtonComponent => {
				// 	return button
				// 		.setTooltip("Edit Database")
				// 		.setIcon("pencil")
				// 		.onClick(async () => {
				// 			let modal = new SettingModal(this.app, this.plugin, this, dbDetails);
				//
				// 			modal.onClose = () => {
				// 				if (modal.data.saved) {
				// 					const dbDetails = {
				// 						format: modal.data.databaseFormat,
				// 						fullName: modal.data.databaseFullName,
				// 						abName: modal.data.databaseAbbreviateName,
				// 						notionAPI: modal.data.notionAPI,
				// 						databaseID: modal.data.databaseID,
				// 						tagButton: modal.data.tagButton,
				// 						customTitleButton: modal.data.customTitleButton,
				// 						customTitleName: modal.data.customTitleName,
				// 						// customValues: modal.data.customValues,
				// 					}
				//
				// 					this.plugin.updateDatabaseDetails(dbDetails);
				//
				// 					this.plugin.commands.updateCommand();
				//
				// 					this.display()
				// 				}
				// 			}
				//
				// 			modal.open();
				// 		});
				// });

				settingEl
				.addButton((button: ButtonComponent): ButtonComponent => {
					return button
						.setTooltip("Delete Database")
						.setIcon("trash")
						.onClick(async () => {
							await this.plugin.deleteDatabaseDetails(dbDetails);

							await this.plugin.commands.updateCommand();

							this.display()
						});
				});
		}
	}
}
function addExtraButton(arg0: (button: ButtonComponent) => ButtonComponent): any {
    throw new Error("Function not implemented.");
}

