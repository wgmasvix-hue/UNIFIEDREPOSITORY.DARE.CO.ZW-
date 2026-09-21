import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HeritageSlide {
  title: string;
  location: string;
  description: string;
  image: string;
  searchQuery: string;
}

@Component({
  selector: 'ds-dare-heritage-carousel',
  templateUrl: './dare-heritage-carousel.component.html',
  styleUrls: ['./dare-heritage-carousel.component.scss'],
  imports: [RouterLink],
})
export class DareHeritageCarouselComponent implements OnInit, OnDestroy {
  slides: HeritageSlide[] = [
    {
      title: 'Great Zimbabwe',
      location: 'Masvingo, Zimbabwe',
      description:
        'An extraordinary archaeological landscape representing centuries of African history, architecture and civilisation.',
      image: '/assets/custom/images/heritage/optimized/great-zimbabwe.webp',
      searchQuery: 'Great Zimbabwe',
    },
    {
      title: 'Victoria Falls',
      location: 'Matabeleland North, Zimbabwe',
      description:
        'Mosi-oa-Tunya — a remarkable landscape connecting natural heritage, geography, tourism and African scholarship.',
      image: '/assets/custom/images/heritage/optimized/victoria-falls.webp',
      searchQuery: 'Victoria Falls',
    },
    {
      title: 'Matobo Hills',
      location: 'Matabeleland South, Zimbabwe',
      description:
        'A landscape of granite formations, archaeology and living cultural heritage at the heart of southern Africa.',
      image: '/assets/custom/images/heritage/optimized/matobo-hills.webp',
      searchQuery: 'Matobo Hills',
    },
    {
      title: 'Khami Ruins',
      location: 'Bulawayo, Zimbabwe',
      description:
        'An important archaeological record of the Torwa State and the sophisticated stone-building traditions of southern Africa.',
      image: '/assets/custom/images/heritage/optimized/khami-ruins.webp',
      searchQuery: 'Khami Ruins',
    },
    {
      title: 'Mana Pools',
      location: 'Mashonaland West, Zimbabwe',
      description:
        'A distinctive Zambezi landscape offering a window into ecology, conservation and the natural sciences.',
      image: '/assets/custom/images/heritage/optimized/mana-pools.webp',
      searchQuery: 'Mana Pools',
    },
    {
      title: 'Domboshava',
      location: 'Mashonaland Central, Zimbabwe',
      description:
        'Granite landscapes and rock art connecting Zimbabwean archaeology, geology and cultural heritage.',
      image: '/assets/custom/images/heritage/optimized/domboshava.webp',
      searchQuery: 'Domboshava',
    },
    {
      title: 'Chinhoyi Caves',
      location: 'Mashonaland West, Zimbabwe',
      description:
        'A remarkable karst landscape opening pathways into geology, hydrology, archaeology and environmental research.',
      image: '/assets/custom/images/heritage/optimized/chinhoyi-caves.webp',
      searchQuery: 'Chinhoyi Caves',
    },
  ];

  activeIndex = 0;
  isPaused = false;

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();

    if (this.isPaused) {
      return;
    }

    this.timer = setInterval(() => {
      this.next(false);
    }, 8000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  next(restartTimer = true): void {
    this.activeIndex = (this.activeIndex + 1) % this.slides.length;

    if (restartTimer) {
      this.startTimer();
    }
  }

  previous(): void {
    this.activeIndex =
      (this.activeIndex - 1 + this.slides.length) % this.slides.length;

    this.startTimer();
  }

  goTo(index: number): void {
    this.activeIndex = index;
    this.startTimer();
  }

  pause(): void {
    this.isPaused = true;
    this.stopTimer();
  }

  resume(): void {
    this.isPaused = false;
    this.startTimer();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.pause();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.resume();
  }
}
