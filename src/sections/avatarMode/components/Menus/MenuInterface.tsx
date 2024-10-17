export interface SubMenuProps {
    handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}