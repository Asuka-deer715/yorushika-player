export interface GalleryCollectionImage {
 id:string;
 name:string;
 url:string;
 credit:string;
 source:string;
 creditSource?:string;
}

const official='https://aop-emtg-jp.s3-ap-northeast-1.amazonaws.com/prod/public/yorushika/contents/information/';
const lawson='https://yorushika.com/news/detail/11312';
const wacom='https://tablet.wacom.co.jp/article/drawing-with-wacom124';
export const collaborations:GalleryCollectionImage[]=[
 {id:'lawson-2021-wallpaper',name:'Lawson × ヨルシカ · 手机壁纸',url:official+'8633f445a85d0780ef1e464929ed00e4.jpg',credit:'包装插画与设计：まごつき（Hurray!） · 联动：Lawson',source:lawson,creditSource:wacom}
];
export const exhibitions:GalleryCollectionImage[]=[
 {id:'gentou-exhibition',name:'ヨルシカ × 加藤隆 · 幻燈展',url:official+'b1a1bc4df0b48648c2de779a57f42574.jpeg',credit:'画集绘画：加藤隆 · 作品：ヨルシカ',source:'https://yorushika.com/news/detail/11499',creditSource:'https://www.universal-music.co.jp/yorushika/products/upzz-1852/'},
 {id:'sun-exhibition-1',name:'永戸鉄也 + ヨルシカ · 太陽',url:official+'aff3785997fbaf0d1c1d5c622abe2f1e.jpeg',credit:'拼贴创作：永戸鉄也 · MV 导演：清水康彦',source:'https://yorushika.com/news/detail/11644',creditSource:'https://yorushika.com/feature/exhibition_sun'},
 {id:'sun-exhibition-2',name:'永戸鉄也 + ヨルシカ · 太陽',url:official+'ed28c2a8c2c23a40b5922d6b02e83b09.jpeg',credit:'拼贴创作：永戸鉄也 · MV 导演：清水康彦',source:'https://yorushika.com/news/detail/11644',creditSource:'https://yorushika.com/feature/exhibition_sun'}
];
