import { Component, computed, input } from '@angular/core';

const BYTES_PER_GIGABYTE = 1e9;
const STORAGE_CAPACITY_GIGABYTES = 20;
const PERCENT = 100;
const PERCENT_PRECISION = 10;

@Component({
  selector: 'app-files-storage',
  templateUrl: './files-storage.component.html',
  styleUrl: './files-storage.component.scss',
})
export class FilesStorageComponent {
  readonly usedBytes = input.required<number>();

  protected readonly label = computed(() => {
    const usedGigabytes = this.usedBytes() / BYTES_PER_GIGABYTE;
    return `${usedGigabytes.toFixed(1)} GB of ${STORAGE_CAPACITY_GIGABYTES} GB used`;
  });
  protected readonly percent = computed(() => {
    const used = (this.usedBytes() / BYTES_PER_GIGABYTE / STORAGE_CAPACITY_GIGABYTES) * PERCENT;
    return Math.round(Math.min(used, PERCENT) * PERCENT_PRECISION) / PERCENT_PRECISION;
  });
}
