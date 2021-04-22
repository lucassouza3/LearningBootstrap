import styles from './styles.module.scss';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';


export function Header() {

  const currentDate = format(new Date(), 'EEEEEE, d MMMM', {/* Documentação https://date-fns.org/v2.21.1/docs/I18n-Contribution-Guide */
    locale: ptBR,
  });

  return (
    <header className={styles.headerContainer}>
      <img src="/logo.svg" alt="Imagem Logo" />
      <p>O melhor para você ouvir, atualmente.</p>
      <span>{currentDate}</span>
    </header>
  );
}