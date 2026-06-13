declare module "zipcelx" {
    interface ZipcelxCell {
        value: string | number;
        type: "string" | "number";
    }

    interface ZipcelxConfig {
        filename: string;
        sheet: {
            data: ZipcelxCell[][];
        };
    }

    export default function zipcelx(config: ZipcelxConfig): void;
}
