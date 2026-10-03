import { booleanAttribute, Component, computed, effect, input, model } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';

const FIRST_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const SMALLEST_PAGE_SIZE = 1;
const RANGE_SEPARATOR = '–';

@Component({
  selector: 'app-pagination',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(DEFAULT_PAGE_SIZE);
  readonly label = input('Pagination');
  readonly pageNumbers = input(false, { transform: booleanAttribute });
  readonly page = model(FIRST_PAGE);

  protected readonly visible = computed(() => this.total() > this.rowsPerPage());
  protected readonly currentPage = computed(() =>
    Math.min(Math.max(this.page(), FIRST_PAGE), this.lastPage()),
  );
  protected readonly onFirstPage = computed(() => this.currentPage() === FIRST_PAGE);
  protected readonly onLastPage = computed(() => this.currentPage() === this.lastPage());
  protected readonly summary = computed(() => {
    const firstRow = (this.currentPage() - FIRST_PAGE) * this.rowsPerPage() + 1;
    const lastRow = Math.min(this.currentPage() * this.rowsPerPage(), this.total());
    return `Showing ${firstRow}${RANGE_SEPARATOR}${lastRow} of ${this.total()}`;
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.lastPage() }, (_, index) => index + FIRST_PAGE),
  );

  private readonly rowsPerPage = computed(() => Math.max(this.pageSize(), SMALLEST_PAGE_SIZE));
  private readonly lastPage = computed(() =>
    Math.max(Math.ceil(this.total() / this.rowsPerPage()), FIRST_PAGE),
  );

  constructor() {
    effect(() => this.page.set(this.currentPage()));
  }

  protected show(page: number): void {
    this.page.set(page);
  }

  protected showPrevious(): void {
    this.page.set(this.currentPage() - 1);
  }

  protected showNext(): void {
    this.page.set(this.currentPage() + 1);
  }
}
