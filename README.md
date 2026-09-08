<p align="center">
  <img src="https://github.com/user-attachments/assets/fd039e72-f0c9-4de3-a92c-271186eeef54" alt="Çanakkale 1915: şafak vakti Boğaz, filo ve Şehitler Abidesi" width="900">
</p>

<h1 align="center">Çanakkale 1915</h1>

<p align="center">
  Şafak vakti Boğaz'ın üstünde sinematik bir anma sahnesi.<br>
  Tarayıcıda açılır. Tek bir model, doku veya fotoğraf dosyası kullanılmadı. Gördüğünüz her şey kodla üretildi.
</p>

<p align="center">
  <a href="https://umutseve4.github.io/canakkale-1915-webgl/"><img src="https://img.shields.io/badge/canl%C4%B1-demo-FF4D4F?style=flat-square" alt="Canlı demo"></a>
  <img src="https://img.shields.io/badge/model%20dosyas%C4%B1-0-FF4D4F?style=flat-square" alt="Sıfır model dosyası">
  <img src="https://img.shields.io/badge/arazi%20in%C5%9Fas%C4%B1-100%20ms-FF4D4F?style=flat-square" alt="Arazi inşası 100 ms">
</p>

<p align="center"><b><a href="https://umutseve4.github.io/canakkale-1915-webgl/">▶ Sahneyi aç</a></b></p>

---

## 30 saniyede ne oluyor?

Kamera açık Ege'den başlıyor, dalgaların üstünden geçip filonun arasına giriyor, kıyıya tırmanıp Şehitler Abidesi'nde duruyor. Deniz gerçekten dalgalanıyor: dört Gerstner dalgası üst üste biniyor, güneş tepelerinde kırılıyor, rüzgâr köpüğü savuruyor. Sis ağır; siperlerde kum torbaları ve kırılmış ağaçlar var. `F` tuşuna basınca top ateşleniyor: parlama, şok halkası, yükselen duman ve gerçek bir ışık kaynağı.

| Girdi | Etki |
|---|---|
| `C` | Sinematik kamera ⇄ serbest gezinme |
| `F` | Topçu atışı |
| `G` | Savaş dumanını aç / kapat |
| Sürükle · tekerlek | Yörünge, yakınlaşma (serbest modda) |
| Kalite düğmesi | Yüksek / Dengeli / Performans |

## Sahnede ne var?

| Katman | Nasıl yapıldı |
|---|---|
| **Arazi** | 400×400 bölmeli düzlem, CPU'da deterministik değer gürültüsüyle (fBm + ridged fBm) yükseltildi. Gürültüyle bozulmuş kıyı çizgisi, dik yamaç, plato, sırt ve dere yatakları. Renk yüksekliğe *ve* eğime göre karışıyor: şelf → kum → kuru maki → çıplak kaya. |
| **Deniz** | Dört Gerstner dalgası, analitik teğet/binormal normaller, Fresnel derinlik karışımı, keskin güneş parıltısı, rüzgâr köpüğü. Yer değiştirme **dünya uzayında** hesaplandığı için karo her karede kameranın altına yeniden ortalanıyor, faz sıçraması olmuyor. |
| **Abide** | Prosedürel Çanakkale Şehitleri Abidesi: basamaklı kaide, dört ayak, lento, lahit, kitabe ve sinüs dalgasıyla dalgalanan bayrak. |
| **Tabya** | Kıyı topları ve mazgallarıyla kavisli burç hattı, gerçek arazi yüksekliğine oturtuldu. |
| **Siperler** | 260 kum torbası tek bir `InstancedMesh` içinde, yüksekliğe göre filtrelendi, hiçbiri havada durmuyor veya toprağa gömülmüyor. |
| **Filo** | 5 düşük poligonlu zırhlı: konikleşen gövde, üstyapı, bacalar, direkler, çift namlulu taretler. Her biri kendi fazında sallanıyor, ardında dümen suyu bırakıyor. |
| **Parçacıklar** | 900 duman noktası, 1400 toz/kıvılcım zerresi, havuzlanmış topçu parlaması. |
| **Kamera** | `CatmullRomCurve3` dolly + ayrı bakış eğrisi; yumuşatılmış hız, elde tutma titreşimi, kuaterniyon güvenli yatış, nefes alan odak uzaklığı. |

## Nasıl çalıştırırım?

Canlı sürüm için [buraya tıklayın](https://umutseve4.github.io/canakkale-1915-webgl/). Yerelde çalıştırmak isterseniz `index.html` dosyasını indirip çift tıklayın. Derleme, `npm install`, sunucu gerekmez.

## Mühendislik notları

**Açılış maliyeti düşürüldü.** Yükseklik alanı her köşe için **tam bir kez** hesaplanıp `Float32Array` ızgarasına yazılıyor; eğim sonra komşu hücrelerden merkezi farkla alınıyor. Bu, köşe başına 5 fBm çağrısının 4'ünü sildi ve arazi inşasını **~495 ms'den ~100 ms'ye** indirdi.

**Gölgeler yüzmüyor.** Yönlü ışık kamerayı takip ediyor ama **bir gölge dokusu piksel boyutundaki dünya ızgarasına kilitleniyor**; dolly hareket ederken gölgeler sürünmüyor.

**Sis iki yerde aynı.** `FogExp2` metriği (`-mvPosition.z`) deniz shader'ında birebir yeniden üretildi, böylece özel shader ile yerleşik sis birbirinden ayrılmıyor.

**Ton eşleme bir kez uygulanıyor.** Three.js render hedefine çizerken shader içi ton eşlemeyi kapattığı için composer yolunda ton eşleme yalnızca `OutputPass`'te yapılıyor, iki yolda da çift uygulama yok.

**Kırılganlığa karşı.** `prefers-reduced-motion` açıksa sahne duruyor başlıyor; canvas odaklanabilir ve etiketli; sekme arka plana geçince render duruyor; `webglcontextlost` yakalanıyor; post-processing yüklenemezse doğrudan render'a düşülüyor.

Bağımlılık: Three.js `0.169.0`, `importmap` ile CDN'den. Derleme adımı, `node_modules` yok.

## Sınırlar

- Bu bir anma sahnesidir, tarihsel yeniden canlandırma değil. Gemiler, tabya ve arazi dönemin *mertebesinde* tasarlandı; belirli bir gemi veya mevzi modellenmedi.
- Three.js CDN'den geldiği için ilk açılışta internet gerekir.
- Mobilde kalite kademesi düşer; geniş ekran için tasarlandı.
- Arazi inşası süresi (~495 ms'den ~100 ms'ye) tek bir masaüstü makinede, Chrome'da, `performance.now()` ile ölçüldü. Cihazdan cihaza değişir; bağımsız bir kıyaslama değil, aynı makinede önce ve sonra ölçümüdür.
- Kare hızı ölçülmedi, o yüzden hiçbir yerde FPS rakamı verilmiyor.

## İkiz depo

[`gallipoli-1915-webgl`](https://github.com/umutseve4/gallipoli-1915-webgl) ([canlı](https://umutseve4.github.io/gallipoli-1915-webgl/)) aynı konunun **ikinci, bağımsız yorumudur**. Kaza değil, fork değil. İkisi de duruyor çünkü asıl yerlerde ayrılıyorlar:

| | `canakkale-1915-webgl` (burası) | `gallipoli-1915-webgl` |
|---|---|---|
| Motor | Three.js **r169** | Three.js **0.167.1** |
| Deniz | 4 Gerstner dalgası, dünya uzayı | 3 toplanmış sinüs, türev normaller |
| Son işlem | `EffectComposer` + bloom | yok, doğrudan render |
| Çerçeveleme | abide merkezli sinematik dolly | geniş savaş sahnesi + HUD saati |
| İmza | Build by Opus 5 | Build by GPT 5.6 |

Karşılaştıracaksanız önce deniz shader'ına ve kamera rigine bakın; iki yorum asıl orada ayrışıyor.

---

MIT lisanslı, bkz. [LICENSE](LICENSE). Kod için; konu, onurlandırdığı ortak mirasın kendisidir. &nbsp;·&nbsp; Build by **Opus 5**.
