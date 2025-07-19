export function getPlatformName(type: number): string {
  switch (type) {
    case 1:
      return 'Xbox Live';
    case 2:
      return 'PSN';
    case 3:
      return 'Steam';
    case 4:
      return 'Blizzard';
    case 5:
      return 'Stadia';
    case 6:
      return 'Epic Games';
    default:
      return 'Inconnu';
  }
}
