import { RtkUiBuilder, UIConfig } from "@cloudflare/realtimekit-ui";
import { Meeting } from "@cloudflare/realtimekit-ui/dist/types/types/rtk-client";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import type { BackgroundMode } from "./BackgroundChanger";
import { BackgroundChanger } from "./BackgroundChanger";
import { PostProcessingConfig } from "@cloudflare/realtimekit-virtual-background/types/client/RealtimeKitVideoBackgroundTransformer";
import { SegmentationConfig } from "@cloudflare/realtimekit-virtual-background/types/core/helpers/segmentationHelper";

export type BackgroundModes = 'blur' | 'virtual' | 'none';

export interface VideoBGAddonArgs {
    images?: string[];
    meeting: Meeting;
    modes?: BackgroundMode[];
    /** Currently only upto 7 random backgrounds will be shown */
    randomCount?: number;
    /** Blur strength can be any value from 0 to 100 */
    blurStrength?: number;
    selector?: string;
    buttonLabel?: string;
    buttonIcon?: string;
    segmentationConfig?: Partial<SegmentationConfig>;
    postProcessingConfig?: Partial<PostProcessingConfig>;
    onVideoBackgroundUpdate?: ({backgroundMode, backgroundURL} : {backgroundMode: BackgroundModes, backgroundURL: string}) => (void | Promise<void>);
}

// svg string of effects icon
const defaultIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.745 4C20.3417 4 20.914 4.23705 21.336 4.65901C21.7579 5.08097 21.995 5.65326 21.995 6.25V12.805C21.5485 12.3774 21.0434 12.0154 20.495 11.73V6.25C20.495 6.05109 20.416 5.86032 20.2753 5.71967C20.1347 5.57902 19.9439 5.5 19.745 5.5H4.25C4.05109 5.5 3.86032 5.57902 3.71967 5.71967C3.57902 5.86032 3.5 6.05109 3.5 6.25V17.755C3.5 18.169 3.836 18.505 4.25 18.505L6.999 18.504L7 15.75C7.00002 15.3108 7.16517 14.8877 7.46268 14.5646C7.76019 14.2415 8.1683 14.0421 8.606 14.006L8.75 14H12.022C11.7223 14.4675 11.484 14.9716 11.313 15.5H8.75C8.69368 15.5001 8.63904 15.5192 8.59493 15.5542C8.55083 15.5893 8.51984 15.6382 8.507 15.693L8.5 15.75L8.499 18.504H11.077C11.1569 19.0193 11.2989 19.5229 11.5 20.004H4.25C3.65344 20.004 3.08129 19.7671 2.65936 19.3453C2.23744 18.9236 2.00027 18.3516 2 17.755V6.25C2 5.65326 2.23705 5.08097 2.65901 4.65901C3.08097 4.23705 3.65326 4 4.25 4H19.745Z"/><path d="M12 7C12.7956 7 13.5587 7.31607 14.1213 7.87868C14.6839 8.44129 15 9.20435 15 10C15 10.7956 14.6839 11.5587 14.1213 12.1213C13.5587 12.6839 12.7956 13 12 13C11.2044 13 10.4413 12.6839 9.87868 12.1213C9.31607 11.5587 9 10.7956 9 10C9 9.20435 9.31607 8.44129 9.87868 7.87868C10.4413 7.31607 11.2044 7 12 7ZM12 8.5C11.6022 8.5 11.2206 8.65804 10.9393 8.93934C10.658 9.22064 10.5 9.60218 10.5 10C10.5 10.3978 10.658 10.7794 10.9393 11.0607C11.2206 11.342 11.6022 11.5 12 11.5C12.3978 11.5 12.7794 11.342 13.0607 11.0607C13.342 10.7794 13.5 10.3978 13.5 10C13.5 9.60218 13.342 9.22064 13.0607 8.93934C12.7794 8.65804 12.3978 8.5 12 8.5Z"/><path d="M23 17.5C23 18.9587 22.4205 20.3576 21.3891 21.3891C20.3576 22.4205 18.9587 23 17.5 23C16.0413 23 14.6424 22.4205 13.6109 21.3891C12.5795 20.3576 12 18.9587 12 17.5C12 16.0413 12.5795 14.6424 13.6109 13.6109C14.6424 12.5795 16.0413 12 17.5 12C18.9587 12 20.3576 12.5795 21.3891 13.6109C22.4205 14.6424 23 16.0413 23 17.5ZM18.055 14.42C18.0207 14.2993 17.9479 14.193 17.8478 14.1174C17.7476 14.0417 17.6255 14.0008 17.5 14.0008C17.3745 14.0008 17.2524 14.0417 17.1522 14.1174C17.0521 14.193 16.9793 14.2993 16.945 14.42L16.388 16.208H14.585C14.019 16.208 13.785 16.962 14.242 17.308L15.7 18.413L15.143 20.2C14.968 20.761 15.584 21.228 16.042 20.881L17.5 19.777L18.958 20.881C19.416 21.228 20.032 20.761 19.857 20.201L19.3 18.413L20.758 17.309C21.216 16.962 20.981 16.208 20.415 16.208H18.612L18.055 14.421V14.42Z"/></svg>';

/**
 * VideoBGAddon
 * @description
 * Addon to add video background effects to RealtimeKit meeting
 * @example
 * const addon = new VideoBGAddon({
 *   images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
 *   modes: ['blur', 'virtual', 'random'],
 *   randomCount: 8,
 *   blurStrength: 50, // 0 to 100
 * });
 */
export default class VideoBGAddon {
    images: string[] = [];
    randomCount: number;
    blurStrength: number;
    modes: BackgroundMode[];
    meeting: Meeting | null = null;
    middleware: any;
    buttonLabel?: string = 'Effects';
    selector?: string;
    buttonIcon?: string;
    segmentationConfig?: Partial<SegmentationConfig>;
    postProcessingConfig?: Partial<PostProcessingConfig>;
    transform: RealtimeKitVideoBackgroundTransformer | null = null;
    currentBackgroundMode: BackgroundModes = 'none';
    currentBackgroundURL:  string | null = null;
    videoBackgroundChanger: BackgroundChanger | null = null;
    onVideoBackgroundUpdate: VideoBGAddonArgs['onVideoBackgroundUpdate'] = null;

    private constructor(args?: VideoBGAddonArgs) {
        this.images = args?.images ?? [];
        this.meeting = args?.meeting;
        this.modes =
            args?.modes !== undefined && args?.modes.length > 0
                ? args.modes
                : ["blur", "virtual", "random"];
        this.randomCount = args?.randomCount ?? 8;
        this.blurStrength = args?.blurStrength ?? 50;
        this.buttonIcon = args.buttonIcon;
        this.buttonLabel = args?.buttonLabel ?? 'Effects';
        if (args.selector) {
            this.selector = args.selector;
        }
        this.segmentationConfig = args?.segmentationConfig || {};
        this.postProcessingConfig = args?.postProcessingConfig || {};
        this.onVideoBackgroundUpdate = args?.onVideoBackgroundUpdate || null;
        if (customElements.get("rtk-background-changer")) return;
        customElements.define("rtk-background-changer", BackgroundChanger);
    }

    private notifyVideoBackgroundUpdate(){
        // notify async so that the addon does not crash in case of issues in the callback
        setTimeout(() => {
            if(this.onVideoBackgroundUpdate){
                this.onVideoBackgroundUpdate({
                    backgroundMode: this.currentBackgroundMode,
                    backgroundURL: this.currentBackgroundURL,
                });
            }
        }, 0);
    }

    private async initializeCoreVideoBackgroundTransformerIfNeeded(){
        if(this.transform){
            return;
        }
        await this.meeting.self.setVideoMiddlewareGlobalConfig({ disablePerFrameCanvasRendering: true });
        
        this.transform = await RealtimeKitVideoBackgroundTransformer.init({
            meeting: this.meeting,
            segmentationConfig: this.segmentationConfig || {},
            postProcessingConfig: this.postProcessingConfig || {},
        });
    }

    static async init(args?: VideoBGAddonArgs) {
        // this is a static method, value of `this` would be undefined or window but never the class instance
        const videoBGAddon = new VideoBGAddon(args);
        
        if (videoBGAddon.modes.includes("random")) {
            const randomImages = await videoBGAddon.getRandomImages(videoBGAddon.randomCount);
            videoBGAddon.images.push(...randomImages);
        }

        /**
         * NOTE(ravindra-cloudflare):
         *  To speed up the initialisation and meeting load,
         *  below part is commented out and optionally initialized using `initializeCoreVideoBackgroundTransformerIfNeeded`.
         *  `initializeCoreVideoBackgroundTransformerIfNeeded` method is called when first middleware is applied.
         */
        // await videoBGAddon.meeting.self.setVideoMiddlewareGlobalConfig({ disablePerFrameCanvasRendering: true });
        
        // videoBGAddon.transform = await RealtimeKitVideoBackgroundTransformer.init({
        //    // @ts-ignore
        //    meeting: videoBGAddon.meeting,
        //    segmentationConfig: videoBGAddon.segmentationConfig || {},
        //    postProcessingConfig: videoBGAddon.postProcessingConfig || {},
        // });

        let existingBackgroundChangerContainer = videoBGAddon.selector ? document.querySelector(videoBGAddon.selector) : document;
        const existingBackgroundChanger = existingBackgroundChangerContainer?.querySelector("rtk-background-changer");
        
        if (existingBackgroundChanger) {
            existingBackgroundChanger.remove();
        }

        const changer = document.createElement("rtk-background-changer") as BackgroundChanger;

        videoBGAddon.videoBackgroundChanger = changer;

        changer.images = videoBGAddon.images;

        changer.modes = videoBGAddon.modes;

        changer['isVideoBackgroundUpdateOngoing'] = false;

        changer.onChange = async (mode: BackgroundMode, imageURL?: string, imageElement?: HTMLImageElement) => {
            if (!videoBGAddon.meeting) return;
            
            if (mode === "blur") {
                await videoBGAddon.applyBlurBackground();
            } else if (mode === "virtual" && imageURL && imageElement && imageElement.complete && imageElement.naturalHeight) {
                /**
                 * NOTE(ravindra-cloudflare): above check of faulty imageElement ensures that no action is taken if image is not fully loaded
                 * It could fail to load if the devs missed adding CORS headers on their images,
                 * on a website where CORS is needed for the image URI.
                 * 
                 * This also speeds up the adding middleware because we will use the data URL instead of image URL.
                 * This is helpful if devs don't have cache headers and have Dev Tools open.
                 *  */ 
                const imageAsDataURL = videoBGAddon.getImageDataURLFromImage(imageElement);
                await videoBGAddon.applyVirtualBackground(imageURL, imageAsDataURL);
            } else if (mode === "none") {
                await videoBGAddon.removeBackground();
            }
        };

        if (videoBGAddon.selector) {
            const el = document.querySelector(videoBGAddon.selector)
            if (el) {
                el.appendChild(changer);
            }
        } else {
            // Add the changer to the body
            document.body.appendChild(changer);
        }

        videoBGAddon.videoBackgroundChanger.highlightSelectedMiddleware(videoBGAddon.currentBackgroundMode, videoBGAddon.currentBackgroundURL);

        return videoBGAddon;
    }

    private getImageDataURLFromImage(img: HTMLImageElement) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        return canvas.toDataURL();
    }

    private async getRandomImages(count: number) {
        let images = [
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_1.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_2.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_3.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_4.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_5.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_6.jpg',
            'https://rtk-assets.realtime.cloudflare.com/backgrounds/bg_7.jpg',
        ];

        let randomCount = Math.min(images.length, count); // Currently only 7 backgrounds are hosted

        images.sort(() => Math.random() > 0.5 ? -1 : 1);
        
        images = images.slice(0, randomCount);
        return images;
    }

    private async imageURLToDataUrl(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.toString());
          reader.readAsDataURL(blob);
        });
    }

    public async applyVirtualBackground(imageURL: string, imageAsDataURL?: string): Promise<{ isSuccessful: boolean; code: string; error?: string }> {
        if (!RealtimeKitVideoBackgroundTransformer.isSupported()){
            return {
                isSuccessful: false,
                code: 'UNSUPPORTED_BROWSER',
                error: 'UI Kit Addon is not supported in this browser or browser version',
            };
        };

        if(this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing']){
            return {
                isSuccessful: false,
                code: 'VIDEO_BACKGROUND_UPDATE_ONGOING',
                error: 'A video background update is already ongoing'
            };
        }

        /**
         * If CORS issue is there in the image, or image didn't load, fail fast
         * 
         * */
        try{
            if(!imageAsDataURL){
                imageAsDataURL = await this.imageURLToDataUrl(imageURL);
            }
        }catch{
            return {
                isSuccessful: false,
                code: 'FAILED_TO_LOAD_IMAGE',
                error: 'Please ensure that the imageURL is correct and is not having any CORS issues',
            };
        }

        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  true;
        await this.initializeCoreVideoBackgroundTransformerIfNeeded();

        await this.removeCurrentMiddleware();

        /**
         * Internally we are passing images as dataURL to not refetch the image in case data cache is disabled,
         * which could be the case with Dev tools being opened. So, we are checking if the imageURL is not a dataURL
         */
        if(imageURL && !this.images.includes(imageURL)){
            this.images.unshift(imageURL);
        }

        if(!imageURL){
            imageURL = this.images[0];
        }

        this.middleware =
            await this.transform.createStaticBackgroundVideoMiddleware(
                imageAsDataURL,
            );
        await this.meeting.self.addVideoMiddleware(this.middleware);
        this.currentBackgroundMode = 'virtual';
        this.currentBackgroundURL = imageURL;

        this.videoBackgroundChanger.highlightSelectedMiddleware(this.currentBackgroundMode, this.currentBackgroundURL);
        
        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  false;
        
        this.notifyVideoBackgroundUpdate();

        return {
            isSuccessful: true,
            code: 'SUCCESSFUL',
        };
    }

    public async applyBlurBackground(): Promise<{ isSuccessful: boolean; code: string; error?: string }> {
        if (!RealtimeKitVideoBackgroundTransformer.isSupported()){
            return {
                isSuccessful: false,
                code: 'UNSUPPORTED_BROWSER',
                error: 'UI Kit Addon is not supported in this browser or browser version',
            };
        };

        if(this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing']){
            return {
                isSuccessful: false,
                code: 'VIDEO_BACKGROUND_UPDATE_ONGOING',
                error: 'A video background update is already ongoing'
            };
        }

        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  true;
        await this.initializeCoreVideoBackgroundTransformerIfNeeded();

        await this.removeCurrentMiddleware();
        
        this.middleware =
            await this.transform.createBackgroundBlurVideoMiddleware(this.blurStrength);
        await this.meeting.self.addVideoMiddleware(this.middleware);
        this.currentBackgroundMode = 'blur';
        this.currentBackgroundURL = null;

        this.videoBackgroundChanger.highlightSelectedMiddleware(this.currentBackgroundMode, this.currentBackgroundURL);
        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  false;

        this.notifyVideoBackgroundUpdate();

        return {
            isSuccessful: true,
            code: 'SUCCESSFUL',
        };
    }

    private async removeCurrentMiddleware() {
        /**
         * NOTE(ravindra-cloudflare):
         * 
         * Even though we should only be removing the current middleware,
         * for a breakout room, if meeting has changed and for the middleware was carry forwarded,
         * It could be that the middleware is part of meeting.self but not the ui-kit-addons instance.
         * 
         * Since most clients, when they use middlewares with disablePerFrameCanvasRendering as true, they use just this middleware alone,
         * and for their custom needs, use meeting.self.videoTrack,
         * therefore going with an assumption that removing all video middlewares won't impact anything.
         * 
         * In future releases, this assumption will be removed.
         */
        // await this.meeting.self.removeVideoMiddleware(this.middleware);
        await this.meeting.self.removeAllVideoMiddlewares();
        this.middleware = null;
        this.currentBackgroundMode = 'none';
        this.currentBackgroundURL = null;
    }

    public async removeBackground() {
        if(this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing']){    
            return {
                isSuccessful: false,
                code: 'VIDEO_BACKGROUND_UPDATE_ONGOING',
                error: 'A video background update is already ongoing'
            };
        }

        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  true;
        await this.initializeCoreVideoBackgroundTransformerIfNeeded();
        
        await this.removeCurrentMiddleware();
        this.videoBackgroundChanger.highlightSelectedMiddleware(this.currentBackgroundMode, this.currentBackgroundURL);
        this.videoBackgroundChanger['isVideoBackgroundUpdateOngoing'] =  false;

        this.notifyVideoBackgroundUpdate();

        return {
            isSuccessful: true,
            code: 'SUCCESSFUL',
        };
    }

    public async unregister() {
        await this.removeBackground();
    }

    private addControlBarButton(selector: any, attributes: { [key: string]: any }) {
        selector.add("rtk-controlbar-button", {
            id: "effects",
            label: this.buttonLabel,
            icon: this.buttonIcon ?? defaultIcon,
            // @ts-ignore
            onClick: () => {
                let backgroundChangerContainer = this.selector ? document.querySelector(this.selector) : document;
                const backgroundChanger = backgroundChangerContainer?.querySelector("rtk-background-changer");
                if (backgroundChanger) {
                    const isOpen =
                    backgroundChanger?.getAttribute("data-open") === "true";
                    backgroundChanger.setAttribute(
                        "data-open",
                        isOpen ? "false" : "true"
                    );
                }
            },
            ...attributes
        });
    }

    public register(config: UIConfig, _meeting: Meeting, getBuilder: (c: UIConfig) => RtkUiBuilder) {
        if (!RealtimeKitVideoBackgroundTransformer.isSupported()) return config;

        // Add buttons with config
        const builder = getBuilder(config);

        // Add Effects in Setup screen
        const setupScreenControls = builder.find('div#setupcontrols-media');
        if(setupScreenControls){
            this.addControlBarButton(setupScreenControls, {
                size: 'sm'
            });
        }

        const controlBar = builder.find("div#controlbar-center");
        if (!controlBar) return config;
        this.addControlBarButton(controlBar, {});

        // Add button in more menu for different screen sizes
        const mdMoreItems = builder.find("rtk-more-toggle", {
            activeMoreMenu: true,
            md: true
        });
        this.addControlBarButton(mdMoreItems, {
            variant: "horizontal",
            slot: "more-elements"
        });

        const smMoreItems = builder.find("rtk-more-toggle", {
            activeMoreMenu: true,
            sm: true
        });
        this.addControlBarButton(smMoreItems, {
            variant: "horizontal",
            slot: "more-elements"
        });

        // Return the updated config
        return builder.build();
    }
}
