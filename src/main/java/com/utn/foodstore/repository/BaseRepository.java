package com.utn.foodstore.repository;

import com.utn.foodstore.model.Base;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import java.util.List;
import java.util.Optional;

@NoRepositoryBean // Para que sea aplantilla y no se isntancie
public interface BaseRepository<E extends Base, ID> extends JpaRepository<E, ID> {

    
    List<E> findByEliminadoFalse();

    Optional<E> findByIdAndEliminadoFalse(ID id);
}