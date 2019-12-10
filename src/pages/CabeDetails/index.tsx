import React, { useState, useEffect } from 'react';
import { Header, Button } from 'react-native-elements';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, Alert } from 'react-native';

import { CabeItem } from 'models/CabeItem';
import { getCabeRequest, updateCabeRequest } from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';

import { Cabe } from 'models/Cabe';
import CabeItems from './CabeItems';
import CabeItemQuantity from './CabeItemQuantity';
import CabeItemValue from './CabeItemValue';

// import { Container } from './styles';

export default function CabeDetails() {
  const id = useNavigationParam('id');
  const { goBack } = useNavigation();
  const [step, setStep] = useState(0);
  const [currentItem, setCurrentItem] = useState<CabeItem | null>(null);
  const [items, setItems] = useState<CabeItem[]>([]);
  const dispatch = useDispatch();
  const cabe = useSelector((state: RootStore) => state.cabes.current);

  const saveItem = () => {
    if (!currentItem) {
      return;
    }

    const index = items.findIndex(i => i.id === currentItem.id);
    if (index >= 0) {
      const itemsCopy = [...items];
      itemsCopy[index] = currentItem;
      setItems(itemsCopy);
    }
  };

  const getCurrentValue = () => {
    return items.reduce(
      (previousValue, currentValue) =>
        currentValue.value * currentValue.quantity + previousValue,
      0
    );
  };

  const notFinalizedItemsCount = () =>
    items.filter(i => i.done === false).length;

  const saveCabe = () => {
    if (cabe) {
      const updatedCabe: Cabe = {
        ...cabe,
        items,
        finalized: true,
      };
      dispatch(updateCabeRequest(updatedCabe));
    }
  };

  const handleSaveCabe = () => {
    if (notFinalizedItemsCount()) {
      Alert.alert(
        'Finalizar Cabe?',
        'Vemos que você não concluiu todos os itens deste Cabe. Deseja finalizar mesmo assim?',
        [{ text: 'Não' }, { text: 'Sim', onPress: saveCabe }]
      );
    } else {
      saveCabe();
    }
  };

  useEffect(() => {
    dispatch(getCabeRequest(id));
  }, []);

  useEffect(() => {
    if (cabe) {
      setItems(cabe.items);
    }
  }, [cabe]);

  useEffect(() => {
    saveItem();
  }, [currentItem]);

  return (
    <>
      <Header
        leftComponent={
          step === 0
            ? { icon: 'arrow-back', onPress: () => goBack() }
            : undefined
        }
        centerComponent={{ text: cabe?.name }}
      />
      {step === 0 && (
        <>
          <CabeItems
            maxValue={cabe ? cabe.value : 0}
            currentValue={getCurrentValue()}
            items={items}
            onClickItem={(item: CabeItem) => {
              setCurrentItem(item);
              setStep(1);
            }}
          />
          {notFinalizedItemsCount() < items.length && (
            <SafeAreaView
              style={{ position: 'absolute', width: '100%', bottom: 0 }}
            >
              <Button
                onPress={handleSaveCabe}
                title="Finalizar"
                type="solid"
                style={{ marginBottom: 10, paddingHorizontal: 20 }}
              />
            </SafeAreaView>
          )}
        </>
      )}
      {step === 1 && (
        <CabeItemQuantity
          itemName={currentItem ? currentItem.name : ''}
          initialQuantity={currentItem ? currentItem.quantity : 0}
          nextStep={(quantity: number) => {
            setStep(2);
            if (currentItem && quantity !== currentItem.quantity) {
              setCurrentItem({ ...currentItem, quantity });
            }
          }}
          previousStep={() => {
            setStep(0);
          }}
        />
      )}
      {step === 2 && (
        <CabeItemValue
          itemName={currentItem ? currentItem.name : ''}
          quantity={currentItem ? currentItem.quantity : 0}
          initialValue={currentItem?.value}
          nextStep={value => {
            if (currentItem && value !== currentItem.value) {
              setCurrentItem({ ...currentItem, value, done: true });
            }
            setStep(0);
          }}
          previousStep={() => {
            setStep(1);
          }}
        />
      )}
    </>
  );
}
